import { isReceiveTransaction } from "../apps/ubi/utils/transactionType";

import CeloIcon from "../assets/images/celonetwork.png";
import FuseIcon from "../assets/images/fusenetwork.png";

import GdIcon from "../assets/images/goodid/gd-icon.png";
import RedTentIcon from "../assets/images/goodid/redtent.png";

import TxGreenIcon from "../assets/images/tx-green.png";
import TxGreyIcon from "../assets/images/tx-grey.png";
import TxRedIcon from "../assets/images/tx-red.png";
import PendingIcon from "../assets/images/pending-icon.png";

export const networkIcons = {
  // 1: EthIcon,
  FUSE: FuseIcon,
  CELO: CeloIcon
};

export const contractIcons = {
  GoodDollar: GdIcon,
  RedTent: RedTentIcon
};

const transactionStateIcons = {
  "claim-start": TxGreyIcon,
  pending: PendingIcon,
  receive: TxGreenIcon,
  send: TxRedIcon
};

export const getContractIcon = (displayName: string) =>
  displayName.includes("GoodDollar") ? contractIcons.GoodDollar : contractIcons.RedTent;

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
  const contractIcon = getContractIcon(transaction.displayName);

  return { txIcon, networkIcon, contractIcon };
};
