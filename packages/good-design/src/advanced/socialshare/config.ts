export interface SocialPlatform {
  id: string;
  name: string;
  color: string;
  icon: string;
  getUrl: (message: string, url: string) => string;
  note?: string;
}

export const SOCIALS: SocialPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    icon: "facebook",
    getUrl: (message: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&hashtag=${encodeURIComponent(message)}`
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

export const DEFAULT_MESSAGE = "I just did my first claim(s) of G$ this week!";
export const DEFAULT_URL = "https://gooddollar.org";
export const DEFAULT_ICON_BASE_PATH = "/assets/svg";
