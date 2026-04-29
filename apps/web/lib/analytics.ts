/**
 * Plausible Analytics — wir tracken bewusst minimal:
 *  - keine Personendaten, kein Fingerprinting, kein DSGVO-Banner nötig
 *  - alle echten Conversion-Events fließen über Stripe + DB, nicht über das Frontend
 *
 * Aktuell wird nur dieser eine Helper benutzt (über `<Plausible>` script tag);
 * Convenience-Wrapper wie `trackCheckoutStarted` hatten wir mal, waren aber
 * nirgends aufgerufen → entfernt im Audit (Tote Codepfade).
 */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> }
    ) => void;
  }
}

export function trackEvent(name: string, props?: Record<string, string>) {
  window.plausible?.(name, props ? { props } : undefined);
}
