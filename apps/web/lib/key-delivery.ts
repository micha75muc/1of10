/**
 * Key delivery (E9) — calls the agents service on Hetzner (whitelisted at
 * DSD Europe) to activate a product and fetch the license key.
 *
 * The agents endpoint is internal-only, gated by a shared bearer token.
 * When DSD_DELIVERY_ENABLED is "false" on agents, a mock key is returned.
 */

import { KEY_DELIVERY_TIMEOUT_MS } from "./constants";

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
  company?: string;
  /**
   * Optional CSV from `Product.dsdMandatoryClientFields` (e.g.
   * "email,first_name,last_name,phone"). When present we validate that the
   * input actually carries those fields before calling the agents service —
   * a missing required field would otherwise surface as a generic DSD
   * 400 deep inside fulfilment, which is harder to debug.
   */
  mandatoryFields?: string | null;
}

/**
 * Map from DSD field name (as returned by `view.json`) to the property on
 * our `DeliveryInput`. Anything outside this map is logged but not
 * enforced (DSD occasionally adds new fields).
 */
const DSD_FIELD_MAP: Record<string, keyof DeliveryInput> = {
  email: "customerEmail",
  name: "customerName",
  first_name: "firstName",
  last_name: "lastName",
  phone: "phone",
  company: "company",
};

function findMissingMandatoryFields(input: DeliveryInput): string[] {
  if (!input.mandatoryFields) return [];
  return input.mandatoryFields
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => {
      const key = DSD_FIELD_MAP[f];
      if (!key) return false; // unknown field — let DSD reject it
      const v = input[key];
      return typeof v !== "string" || v.trim() === "";
    });
}

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

  // Defense-in-depth — if we know which fields DSD requires for this SKU
  // and a required value is missing locally, bail out with a precise error
  // before round-tripping to the agents service.
  const missing = findMissingMandatoryFields(input);
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing DSD-mandatory client fields for ${input.productCode}: ${missing.join(", ")}`,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), KEY_DELIVERY_TIMEOUT_MS);

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
        company: input.company,
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
