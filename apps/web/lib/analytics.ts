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

export function trackCheckoutStarted(productName: string) {
  trackEvent("Checkout Started", { product: productName });
}

export function trackPurchaseComplete(productName: string) {
  trackEvent("Purchase Complete", { product: productName });
}

export function trackWinnerRevealed() {
  trackEvent("Winner Revealed");
}

export function trackShareClicked(medium: string) {
  trackEvent("Share Clicked", { medium });
}
