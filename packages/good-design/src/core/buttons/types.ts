import { TransactionStatus } from "@usedapp/core";
import { IModalProps } from "native-base";

export interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  redirectUrl?: string;
  claim: () => Promise<boolean>;
  chainId?: number;
  styles?: any;
  claimed?: { claimed: boolean; state: TransactionStatus };
  refresh?: "everyBlock" | "never" | number | undefined;
  handleConnect?: () => Promise<boolean>;
}

export type FVModalProps = IModalProps & FVFlowProps;

export interface ClaimCardContent {
  subTitle?: {
    text: string;
    color: string;
  };
  description?: {
    text: string;
    color: string;
  };
  imageUrl?: string;
  imgSrc?: any;
  link?: {
    linkText: string;
    linkUrl: string;
  };
  list?: Array<{ id: string; key: string; value: string }>;
}
export interface IClaimCard {
  id: string;
  title: {
    text: string;
    color: string;
  };
  externalLink?: string;
  bgColor: string;
  content?: Array<ClaimCardContent>;
  hide?: boolean;
}
