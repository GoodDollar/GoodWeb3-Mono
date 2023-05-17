import GdWalletWebp from "../../../../assets/icons/webp/GdWallet.webp";
import GnosisIconWebp from "../../../../assets/icons/webp/Gnosis.webp";
import ValoraIconWebp from "../../../../assets/icons/webp/valora.webp";
import CeloSafeWebp from "../../../../assets/icons/webp/Celo.webp";

import ValoraIconSvg from "../../../../assets/icons/svg/valora.svg";
import GdWalletSvg from "../../../../assets/icons/svg/GdWallet.svg";
import ZengoSvg from "../../../../assets/icons/svg/Zengo.svg";

export const icons = {
  gooddollar: {
    svg: GdWalletSvg,
    webp: GdWalletWebp
  },
  zengo: {
    svg: ZengoSvg,
    webp: undefined
  },
  valora: {
    svg: ValoraIconSvg,
    webp: ValoraIconWebp
  },
  safe: {
    svg: undefined,
    webp: GnosisIconWebp
  },
  celosafe: {
    svg: undefined,
    webp: CeloSafeWebp
  }
};
