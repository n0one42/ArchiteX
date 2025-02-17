// src/lib/popupWindow.ts
export interface PopupWindowFeatures {
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

export interface PopupWindowResult {
  provider: string;
  token: string;
  requestId: string;
}

export class PopupWindow {
  private popupWindow: Window | null = null;
  private pollTimer: number | null = null;

  public open(url: string, features?: PopupWindowFeatures): Promise<PopupWindowResult> {
    return new Promise((resolve, reject) => {
      const popup = window.open(url, "_blank", this.stringifyFeatures(features));
      if (!popup) {
        return reject(new Error("Popup blocked or failed to open."));
      }
      this.popupWindow = popup;

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === "oauth_callback") {
          resolve(event.data.data);
          cleanup();
        }
      };

      window.addEventListener("message", messageListener);

      this.pollTimer = window.setInterval(() => {
        if (!popup || popup.closed) {
          reject(new Error("Popup closed unexpectedly."));
          cleanup();
        }
      }, 500);

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

  private stringifyFeatures(features?: PopupWindowFeatures): string {
    const defaultFeatures: PopupWindowFeatures = {
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
      .filter(([, value]) => typeof value === "boolean" || typeof value === "number")
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
  }
}
