/**
 * Key delivery (E9) — calls the agents service on Hetzner (whitelisted at
 * DSD Europe) to activate a product and fetch the license key.
 *
 * The agents endpoint is internal-only, gated by a shared bearer token.
 * When DSD_DELIVERY_ENABLED is "false" on agents, a mock key is returned.
 */

export interface DeliveryResult {
  ok: boolean;
  licenseKey?: string;
  certificateId?: string;
  error?: string;
}

interface DeliveryInput {
  productCode: string;
  customerEmail: string;
  reference: string; // order.id
  customerName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const DELIVERY_TIMEOUT_MS = 45_000; // DSD can take 20-30s under load

export async function deliverLicenseKey(input: DeliveryInput): Promise<DeliveryResult> {
  // TEST_MODE: return a deterministic dummy key without calling the agents
  // service. Used for end-to-end email-flow verification in Stripe test mode.
  if (process.env.TEST_MODE === "true") {
    const suffix = input.reference.slice(0, 8).toUpperCase();
    return {
      ok: true,
      licenseKey: `DUMMY-TEST-${suffix}-XXXX`,
      certificateId: `test_cert_${input.reference.slice(0, 12)}`,
    };
  }

  const agentsUrl = process.env.AGENTS_API_URL;
  const secret = process.env.AGENTS_INTERNAL_SECRET;

  if (!agentsUrl || !secret) {
    return {
      ok: false,
      error: "AGENTS_API_URL or AGENTS_INTERNAL_SECRET not configured",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

  try {
    const res = await fetch(`${agentsUrl.replace(/\/+$/, "")}/internal/procurement/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        product_code: input.productCode,
        client_email: input.customerEmail,
        reference: input.reference,
        client_name: input.customerName,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Agents HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = (await res.json()) as {
      ok: boolean;
      license_key?: string;
      certificate_id?: string;
      error?: string;
    };

    return {
      ok: data.ok,
      licenseKey: data.license_key,
      certificateId: data.certificate_id,
      error: data.error,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Agents activation timed out" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}
