// src/lib/oauth-popup.ts
export interface IOAuthPopupFeatures {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  menubar?: boolean;
  toolbar?: boolean;
  location?: boolean;
  resizable?: boolean;
  scrollbars?: boolean;
  status?: boolean;
  center?: boolean;
}

export interface OAuthPopupResult {
  linkingUrl: string;
}

export class OAuthPopup {
  private popupWindow: Window | null = null;
  private pollTimer: number | null = null;

  /**
   * Opens a popup window and returns a Promise that resolves when a message is received
   * from the popup via postMessage.
   */
  public open(url: string, features?: IOAuthPopupFeatures): Promise<OAuthPopupResult> {
    return new Promise((resolve, reject) => {
      const popupWindow = window.open(url, "_blank", this.stringifyFeatures(features));
      if (!popupWindow) {
        return reject(new Error("Popup blocked or failed to open."));
      }
      this.popupWindow = popupWindow;

      // Listener for postMessage from the popup (OAuth callback page)
      const messageListener = (event: MessageEvent) => {
        // Make sure the message comes from our own domain (the redirect URI should be on our domain)
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === "oauth_callback") {
          resolve(event.data.data);
          cleanup();
        }
      };

      window.addEventListener("message", messageListener);

      // Polling: if the user closes the popup without completing the flow, reject the promise.
      this.pollTimer = window.setInterval(() => {
        if (!popupWindow || popupWindow.closed) {
          reject(new Error("Popup closed unexpectedly."));
          cleanup();
        }
      }, 500);

      // Cleanup event listeners and timers
      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        if (this.pollTimer !== null) {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
        }
        if (this.popupWindow && !this.popupWindow.closed) {
          this.popupWindow.close();
        }
        this.popupWindow = null;
      };
    });
  }

  /**
   * Converts features into a comma-separated string suitable for window.open.
   */
  private stringifyFeatures(features?: IOAuthPopupFeatures): string {
    const defaultFeatures: IOAuthPopupFeatures = {
      width: 550,
      height: 650,
      menubar: false,
      toolbar: false,
      location: false,
      resizable: true,
      scrollbars: true,
      status: false,
      center: true,
    };
    const finalFeatures = { ...defaultFeatures, ...features };

    if (finalFeatures.center) {
      const screenLeft = window.screenLeft ?? window.screenX ?? 0;
      const screenTop = window.screenTop ?? window.screenY ?? 0;
      const screenWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
      const screenHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;
      finalFeatures.left = Math.round(screenLeft + (screenWidth - (finalFeatures.width || 0)) / 2);
      finalFeatures.top = Math.round(screenTop + (screenHeight - (finalFeatures.height || 0)) / 2);
    }

    return Object.entries(finalFeatures)
      .filter(([_, value]) => typeof value === "boolean" || typeof value === "number")
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
  }
}
