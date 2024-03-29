import { IModalProps } from "native-base";
import { TransactionStatus } from "@usedapp/core";

export interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  redirectUrl?: string;
  claim: () => Promise<boolean>;
  chainId?: number;
  styles?: any;
  claimed?: boolean;
  claiming?: TransactionStatus;
  refresh?: "everyBlock" | "never" | number | undefined;
  handleConnect?: () => Promise<boolean>;
  onEvent?: (event: string) => void;
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
