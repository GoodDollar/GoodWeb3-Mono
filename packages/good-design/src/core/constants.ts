import BillyWaiting from "../assets/images/billy-waiting.png";
import BillySign from "../assets/images/billy-sign.png";

export type learnSources = "send" | "bridging" | "network" | "sign" | "signMultiClaim" | "identity";
type links = { link: string; label: string; icon: any };

export const linksNew: Record<learnSources, links> = {
  send: {
    link: "https://gooddollar.notion.site/How-do-transactions-work-in-web3-ccf11b4e16874a1682722a20c4e24742",
    label: /*i18n*/ "How do transactions work?",
    icon: BillyWaiting
  },
  bridging: {
    link: "https://gooddollar.notion.site/What-is-bridging-f42ec5d3c388454bb2266411a67d93f5",
    label: /*i18n*/ "How does bridging work?",
    icon: BillyWaiting
  },
  network: {
    link: "https://gooddollar.notion.site/What-is-a-web3-network-4bf6c8efecab4834b25c006f57687cc6",
    label: /*i18n*/ "What is a web3 network?",
    icon: BillyWaiting
  },
  sign: {
    link: "https://gooddollar.notion.site/What-is-signing-b0019fe6c43241068050c9aa16e87ee1",
    label: /*i18n*/ "What is signing?",
    icon: BillySign
  },
  signMultiClaim: {
    link: "https://gooddollar.notion.site/What-is-signing-b0019fe6c43241068050c9aa16e87ee1",
    label: /*i18n*/ "What is signing?",
    icon: BillySign
  },
  identity: {
    link: "https://docs.gooddollar.org/about-the-protocol/sybil-resistance",
    label: /*i18n*/ "Learn about the identification process",
    icon: BillySign
  }
};

export type sourceOrAlt = {
  source: learnSources;
};
