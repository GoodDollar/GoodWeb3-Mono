import { IModalProps } from "native-base";

export interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  claimed?: boolean;
  refresh?: "everyBlock" | "never" | number | undefined;
  claim: () => Promise<boolean>;
}

export type FVModalProps = IModalProps & FVFlowProps;

export interface ClaimCardContent {
  description?: string;
  imageUrl?: string;
  link?: {
    linkText: string;
    linkUrl: string;
  };
  list?: Array<{ key: string; value: string }>;
}
export interface IClaimCard {
  title: string;
  content?: Array<ClaimCardContent>;
}
