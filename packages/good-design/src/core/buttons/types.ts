import { IModalProps } from "native-base";

export interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  refresh?: "everyBlock" | "never" | number | undefined;
  claim: () => Promise<void>;
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
