import { isReceiveTransaction } from "../apps/ubi/utils/transactionType";

import CeloIcon from "../assets/images/celonetwork.png";
import FuseIcon from "../assets/images/fusenetwork.png";
import XdcIcon from "../assets/images/xdcnetwork.png";
import CeloIconDark from "../assets/images/celo-dark.svg";
import EthIcon from "../assets/images/ethereum-eth-logo.png";

import GdIcon from "../assets/images/goodid/gd-icon.png";

import TxGreenIcon from "../assets/images/tx-green.png";
import TxGreyIcon from "../assets/images/tx-grey.png";
import TxRedIcon from "../assets/images/tx-red.png";
import PendingIcon from "../assets/images/pending-icon.png";

export const networkIcons = {
  FUSE: FuseIcon,
  CELO: CeloIcon,
  XDC: XdcIcon,
  MAINNET: EthIcon,
  CELO_DARK: CeloIconDark
};

export const getBridgeNetworkIcon = (chain: string) => {
  const key = chain.toUpperCase() as keyof typeof networkIcons;
  if (key === "CELO") return networkIcons.CELO_DARK;
  return networkIcons[key];
};

export const contractIcons = {
  GoodDollar: GdIcon
};

const transactionStateIcons = {
  "claim-start": TxGreyIcon,
  pending: PendingIcon,
  receive: TxGreenIcon,
  send: TxRedIcon
};

export const getContractIcon = () => contractIcons.GoodDollar;

export const getTransactionIcon = (transaction: any) => {
  const { type, status } = transaction;
  let iconKey: keyof typeof transactionStateIcons = "send";

  if (type === "claim-start") iconKey = "claim-start";
  if (status === "pending") iconKey = "pending";
  if (isReceiveTransaction(transaction)) iconKey = "receive";

  return transactionStateIcons[iconKey];
};

export const getTxIcons = (transaction: any) => {
  const txIcon = getTransactionIcon(transaction);
  const networkIcon = networkIcons[transaction.network as keyof typeof networkIcons];
  const contractIcon = getContractIcon();

  return { txIcon, networkIcon, contractIcon };
};
