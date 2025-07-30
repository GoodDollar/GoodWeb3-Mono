interface SocialPlatform {
  id: string;
  name: string;
  color: string;
  icon: string;
  getUrl: (message: string, url: string) => string;
  note?: string;
}

const SOCIALS: SocialPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    icon: "facebook",
    getUrl: (message: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`
  },
  {
    id: "x",
    name: "X",
    color: "#000000",
    icon: "x",
    getUrl: (message: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    icon: "linkedin",
    getUrl: (message: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "#E4405F",
    icon: "instagram",
    getUrl: () => "https://www.instagram.com/",
    note: "Copy your message and share it on Instagram!"
  }
];

export interface SocialShareWidgetOptions {
  message: string;
  url: string;
  containerId?: string;
  className?: string;
  iconSize?: number;
  platforms?: string[];
  iconBasePath?: string;
}

export class SocialShareWidget {
  private options: SocialShareWidgetOptions;
  private container: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private static instanceCount = 0;

  constructor(options: SocialShareWidgetOptions) {
    this.options = {
      iconBasePath: "/assets/svg",
      ...options
    };
    SocialShareWidget.instanceCount++;
  }

  private createStyles(): string {
    return `
      .social-share-widget {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 20px;
      }
      .social-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s ease;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center;
      }
      .social-button:hover {
        opacity: 0.8;
      }
      .more-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #EBF8FF;
        transition: opacity 0.2s ease;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center;
      }
      .more-button:hover {
        opacity: 0.8;
      }
      .instagram-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .instagram-modal-content {
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .instagram-modal-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #333;
      }
      .instagram-modal-body {
        margin-bottom: 20px;
      }
      .instagram-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
      .instagram-modal-text {
        color: #666;
        margin-bottom: 10px;
        line-height: 1.5;
      }
      .instagram-modal-note {
        color: #999;
        font-size: 12px;
      }
      .instagram-modal-footer {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .modal-button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      }
      .modal-button-cancel {
        background: #f0f0f0;
        color: #333;
      }
      .modal-button-copy {
        background: #00AFFF;
        color: white;
      }
      .modal-button:hover {
        opacity: 0.8;
      }
    `;
  }

  private copyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            console.log("Message copied to clipboard!");
            resolve();
          })
          .catch(err => {
            console.error("Failed to copy to clipboard:", err);
            reject(err);
          });
      } else {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          const success = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (success) {
            console.log("Message copied to clipboard!");
            resolve();
          } else {
            reject(new Error("Failed to copy to clipboard"));
          }
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  private createSocialButton(social: SocialPlatform): HTMLElement {
    const button = document.createElement("button");
    button.className = "social-button";
    button.style.backgroundColor = social.color;
    button.style.backgroundImage = `url('${this.options.iconBasePath}/${social.icon}.svg')`;
    button.title = `Share on ${social.name}`;

    button.addEventListener("click", () => {
      if (social.id === "instagram") {
        this.showInstagramModal();
      } else {
        void window.open(social.getUrl(this.options.message, this.options.url), "_blank", "noopener,noreferrer");
      }
    });

    return button;
  }

  private createInstagramModal(): HTMLElement {
    const modal = document.createElement("div");
    modal.className = "instagram-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "instagram-modal-content";

    // Create header
    const header = document.createElement("div");
    header.className = "instagram-modal-header";
    header.textContent = "Share on Instagram";
    modalContent.appendChild(header);

    // Create body
    const body = document.createElement("div");
    body.className = "instagram-modal-body";

    const icon = document.createElement("div");
    icon.className = "instagram-icon";
    icon.style.backgroundImage = `url('${this.options.iconBasePath}/instagram.svg')`;
    body.appendChild(icon);

    const text = document.createElement("div");
    text.className = "instagram-modal-text";
    text.textContent = "Your message has been copied to clipboard. You can now paste it on Instagram!";
    body.appendChild(text);

    const note = document.createElement("div");
    note.className = "instagram-modal-note";
    note.textContent = "Copy your message and share it on Instagram!";
    body.appendChild(note);

    modalContent.appendChild(body);

    // Create footer
    const footer = document.createElement("div");
    footer.className = "instagram-modal-footer";

    const cancelButton = document.createElement("button");
    cancelButton.className = "modal-button modal-button-cancel";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      this.closeInstagramModal();
    });
    footer.appendChild(cancelButton);

    const copyButton = document.createElement("button");
    copyButton.className = "modal-button modal-button-copy";
    copyButton.textContent = "Copy Message";
    copyButton.addEventListener("click", async () => {
      try {
        await this.copyToClipboard(this.options.message);
        this.showCopySuccess();
        this.closeInstagramModal();
      } catch (err) {
        this.showCopyError();
      }
    });
    footer.appendChild(copyButton);

    modalContent.appendChild(footer);
    modal.appendChild(modalContent);

    // Close modal when clicking outside
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        this.closeInstagramModal();
      }
    });

    return modal;
  }

  private showCopySuccess(): void {
    // Create a simple success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1001;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    notification.textContent = "Message copied to clipboard!";
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 2000);
  }

  private showCopyError(): void {
    // Create a simple error notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1001;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    notification.textContent = "Failed to copy message. Please try again.";
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  private showInstagramModal(): void {
    // Remove existing modal if any
    if (this.modal) {
      document.body.removeChild(this.modal);
    }

    this.modal = this.createInstagramModal();
    document.body.appendChild(this.modal);
  }

  private closeInstagramModal(): void {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
    }
  }

  render(container?: HTMLElement | null): HTMLElement {
    // Add styles if not already added
    if (!document.getElementById("social-share-widget-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "social-share-widget-styles";
      styleElement.textContent = this.createStyles();
      document.head.appendChild(styleElement);
    }

    // Determine which platforms to show
    let socialsToShow = SOCIALS;
    if (this.options.platforms && Array.isArray(this.options.platforms)) {
      socialsToShow = SOCIALS.filter(social => this.options.platforms?.includes(social.id) || false);
    }

    // Create container if not provided
    if (!container) {
      if (this.options.containerId) {
        container = document.getElementById(this.options.containerId);
        if (!container) {
          throw new Error(`Container with id '${this.options.containerId}' not found`);
        }
      } else {
        container = document.createElement("div");
        container.className = this.options.className || "social-share-widget";
      }
    }

    // Clear existing content
    container.innerHTML = "";

    // Create social share bar
    const socialShareBar = document.createElement("div");
    socialShareBar.className = "social-share-widget";

    // Add Facebook, X, LinkedIn buttons
    socialsToShow.slice(0, 3).forEach(social => {
      const button = this.createSocialButton(social);
      socialShareBar.appendChild(button);
    });

    // Add More button if there are additional platforms
    if (socialsToShow.length > 3) {
      const moreButton = document.createElement("button");
      moreButton.className = "more-button";
      moreButton.style.backgroundImage = `url('${this.options.iconBasePath}/more-button.svg')`;
      moreButton.title = "More sharing options";
      moreButton.addEventListener("click", () => {
        this.showInstagramModal();
      });
      socialShareBar.appendChild(moreButton);
    }

    container.appendChild(socialShareBar);
    this.container = container;

    return container;
  }

  destroy(): void {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
    }
    if (this.container) {
      this.container.innerHTML = "";
    }

    // Remove styles if this is the last instance
    SocialShareWidget.instanceCount--;
    if (SocialShareWidget.instanceCount === 0) {
      const styleElement = document.getElementById("social-share-widget-styles");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    }
  }
}

export function createSocialShareWidget(options: SocialShareWidgetOptions): SocialShareWidget {
  return new SocialShareWidget(options);
}

// Auto-initialize widgets with data-social-share attribute
document.addEventListener("DOMContentLoaded", () => {
  const widgets = document.querySelectorAll("[data-social-share]");
  widgets.forEach(element => {
    const message = element.getAttribute("data-message") || "I just did my first claim(s) of G$ this week!";
    const url = element.getAttribute("data-url") || "https://gooddollar.org";
    const platforms = element.getAttribute("data-platforms")?.split(",") || undefined;

    const widget = new SocialShareWidget({
      message,
      url,
      containerId: element.id,
      platforms
    });

    widget.render(element as HTMLElement);
  });
});
