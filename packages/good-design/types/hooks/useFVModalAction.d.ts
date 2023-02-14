import { FVFlowProps } from "../core";
interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
    onClose: () => void;
    redirectUrl?: string;
    chainId?: number;
}
export declare const useFVModalAction: ({ firstName, method, onClose, chainId, redirectUrl }: FVModalActionProps) => {
    loading: boolean;
    verify: () => Promise<void>;
};
export {};
//# sourceMappingURL=useFVModalAction.d.ts.map