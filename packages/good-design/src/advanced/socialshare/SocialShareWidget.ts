interface SocialPlatform {
  name: string;
  color: string;
  icon: string;
  getUrl: (message: string, url: string) => string;
  note?: string;
}

const SOCIALS: SocialPlatform[] = [
  {
    name: "Facebook",
    color: "#1877F2",
    icon: "facebook",
    getUrl: (message: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`
  },
  {
    name: "X",
    color: "#000000",
    icon: "x",
    getUrl: (message: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    icon: "linkedin",
    getUrl: (message: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  },
  {
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
}

export class SocialShareWidget {
  private options: SocialShareWidgetOptions;
  private container: HTMLElement | null = null;
  private modal: HTMLElement | null = null;

  constructor(options: SocialShareWidgetOptions) {
    this.options = options;
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

  private copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Message copied to clipboard!");
        })
        .catch(err => {
          console.error("Failed to copy to clipboard:", err);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("Message copied to clipboard!");
    }
  }

  private createSocialButton(social: SocialPlatform): HTMLElement {
    const button = document.createElement("button");
    button.className = "social-button";
    button.style.backgroundColor = social.color;
    button.style.backgroundImage = `url('/assets/svg/${social.icon}.svg')`;
    button.title = `Share on ${social.name}`;

    button.addEventListener("click", () => {
      if (social.name === "Instagram") {
        this.showInstagramModal();
      } else {
        void window.open(social.getUrl(this.options.message, this.options.url), "_blank", "noopener,noreferrer");
      }
    });

    return button;
  }

  private showInstagramModal(): void {
    // Remove existing modal if any
    if (this.modal) {
      document.body.removeChild(this.modal);
    }

    this.modal = document.createElement("div");
    this.modal.className = "instagram-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "instagram-modal-content";

    modalContent.innerHTML = `
      <div class="instagram-modal-header">Share on Instagram</div>
      <div class="instagram-modal-body">
        <div class="instagram-icon" style="background-image: url('/assets/svg/instagram.svg')"></div>
        <div class="instagram-modal-text">
          Your message has been copied to clipboard. You can now paste it on Instagram!
        </div>
        <div class="instagram-modal-note">
          Copy your message and share it on Instagram!
        </div>
      </div>
      <div class="instagram-modal-footer">
        <button class="modal-button modal-button-cancel" onclick="this.closest('.instagram-modal').remove()">Cancel</button>
        <button class="modal-button modal-button-copy" onclick="this.closest('.instagram-modal').remove(); this.copyMessage()">Copy Message</button>
      </div>
    `;

    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);

    // Add copy function to window
    (window as any).copyMessage = () => {
      this.copyToClipboard(this.options.message);
    };

    // Close modal when clicking outside
    this.modal.addEventListener("click", e => {
      if (e.target === this.modal && this.modal) {
        document.body.removeChild(this.modal);
        this.modal = null;
      }
    });
  }

  render(container?: HTMLElement | null): HTMLElement {
    // Add styles if not already added
    if (!document.getElementById("social-share-widget-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "social-share-widget-styles";
      styleElement.textContent = this.createStyles();
      document.head.appendChild(styleElement);
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
    SOCIALS.slice(0, 3).forEach(social => {
      const button = this.createSocialButton(social);
      socialShareBar.appendChild(button);
    });

    // Add More button
    const moreButton = document.createElement("button");
    moreButton.className = "more-button";
    moreButton.style.backgroundImage = "url('/assets/svg/more-button.svg')";
    moreButton.title = "More sharing options";
    moreButton.addEventListener("click", () => {
      this.showInstagramModal();
    });
    socialShareBar.appendChild(moreButton);

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

    const widget = new SocialShareWidget({
      message,
      url,
      containerId: element.id
    });

    widget.render(element as HTMLElement);
  });
});
