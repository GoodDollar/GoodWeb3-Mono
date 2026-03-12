export type MPBBridgeFlowState =
  | "idle"
  | "awaiting_wallet_connection"
  | "awaiting_network_switch"
  | "awaiting_approval_signature"
  | "approval_mining"
  | "awaiting_bridge_signature"
  | "bridge_mining"
  | "success"
  | "failed"
  | "cancelled";

export type MPBBridgeFlowErrorCode = "user_rejected" | "execution_failed" | "unknown";

export interface MPBBridgeFlowError {
  code: MPBBridgeFlowErrorCode;
  message: string;
}

export interface MPBBridgeFlowTxHashes {
  approve?: string;
  bridgeTo?: string;
  final?: string;
}

export interface MPBBridgeFlowStatusInput {
  status?: string;
  errorMessage?: string;
  transaction?: {
    hash?: string;
  };
}

export interface DeriveMPBBridgeFlowStateParams {
  bridgeStatus?: MPBBridgeFlowStatusInput;
  isSwitchingChain?: boolean;
  previousTxHashes?: MPBBridgeFlowTxHashes;
  canSubmit?: boolean;
  hasFeeError?: boolean;
}

export interface MPBBridgeFlowSnapshot {
  state: MPBBridgeFlowState;
  statusLabel: string;
  isBusy: boolean;
  error?: MPBBridgeFlowError;
  showSuccess: boolean;
  currentTxHashes: MPBBridgeFlowTxHashes;
  canSubmit: boolean;
}

export interface UseMPBBridgeFlowParams {
  bridgeProvider?: "axelar" | "layerzero";
  sourceChain?: string;
  targetChain?: string;
  amountWei?: string;
  account?: string;
  canSubmit?: boolean;
  hasFeeError?: boolean;
}
