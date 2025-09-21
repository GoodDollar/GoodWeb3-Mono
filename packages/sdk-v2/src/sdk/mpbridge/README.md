# MPB (Main Bridge) SDK

This module provides the SDK implementation for the Main Bridge (MPB) functionality, which enables cross-chain bridging of G$ tokens between Fuse, Celo, and Mainnet using LayerZero/Axelar.

## Features

- **Cross-chain bridging**: Bridge G$ tokens between Fuse, Celo, and Mainnet
- **LayerZero/Axelar integration**: Uses LayerZero or Axelar for cross-chain communication
- **Fee estimation**: Dynamic fee calculation in native tokens
- **Transaction status tracking**: Monitor bridge transaction status
- **Explorer links**: Direct links to LayerZero/Axelar explorers
- **Bridge history**: Track past bridge transactions

## Components

### SDK Functions

- `useMPBBridge()` - Main bridge hook for initiating bridge transactions
- `useMPBBridgeLimits()` - Check if a bridge transaction is within limits
- `useGetMPBBridgeData()` - Get bridge fees and limits data
- `useMPBBridgeHistory()` - Get bridge transaction history
- `getLayerZeroExplorerLink()` - Get LayerZero explorer link for a transaction
- `getAxelarExplorerLink()` - Get Axelar explorer link for a transaction

### UI Components

- `MPBBridge` - Main bridge UI component for user interaction
- `MPBBridgeController` - Controller component for managing bridge state
- `MPBBridgeHistory` - Component for displaying bridge transaction history

## Usage

### Basic Bridge Transaction

```typescript
import { useMPBBridge } from "@gooddollar/web3sdk-v2";

const { sendMPBBridgeRequest, bridgeRequestStatus, bridgeStatus } = useMPBBridge();

// Initiate a bridge transaction
await sendMPBBridgeRequest("1000000000000000000000", "fuse"); // 1000 G$ from Fuse to Celo
```

### Check Bridge Limits

```typescript
import { useMPBBridgeLimits } from "@gooddollar/web3sdk-v2";

const { isValid, reason } = useMPBBridgeLimits("1000000000000000000000");
```

### Get Bridge Data

```typescript
import { useGetMPBBridgeData } from "@gooddollar/web3sdk-v2";

const { bridgeFees, bridgeLimits } = useGetMPBBridgeData();
```

### Using the UI Component

```typescript
import { MPBBridgeController } from "@gooddollar/good-design";

const MyBridgePage = () => {
  return (
    <MPBBridgeController
      withHistory={true}
      onBridgeStart={() => console.log("Bridge started")}
      onBridgeSuccess={() => console.log("Bridge succeeded")}
      onBridgeFailed={error => console.log("Bridge failed:", error)}
    />
  );
};
```

## Bridge Flow

1. **User selects source and target chains** (Fuse ↔ Celo ↔ Mainnet)
2. **Enter amount to bridge** (minimum 1000 G$)
3. **System calculates fees** (dynamic native token fees)
4. **User approves transaction** (with fee in native token)
5. **Bridge transaction is sent** (via LayerZero/Axelar)
6. **Transaction status is tracked** (mining → success/fail)
7. **Explorer links provided** (LayerZero/Axelar explorers)

## Supported Chains

- **Fuse (Chain ID: 122)**: Fuse network
- **Celo (Chain ID: 42220)**: Celo network
- **Mainnet (Chain ID: 1)**: Ethereum mainnet

## Fee Structure

- **Dynamic fees**: Fees are calculated based on LayerZero/Axelar requirements
- **Native token payment**: Fees are paid in the native token of the source chain
- **Variable amounts**: Fees vary based on network conditions and transaction size

## Contract Addresses

The MPB contracts are deployed at the following addresses:

```typescript
const MPB_CONTRACTS = {
  [SupportedChains.FUSE]: "0x5B7cEfD0e7d952F7E400416F9c98fE36F1043822", // Fuse bridge
  [SupportedChains.CELO]: "0x165aEb4184A0cc4eFb96Cb6035341Ba2265bA564", // Celo bridge
  [SupportedChains.MAINNET]: "0x08fdf766694C353401350c225cAEB9C631dC3288" // Mainnet bridge
};
```

## Explorer Integration

- **LayerZero Explorer**: `https://layerzeroscan.com/{chain}/tx/{txHash}`
- **Axelar Explorer**: `https://axelarscan.io/{chain}/tx/{txHash}`

## Error Handling

The SDK provides comprehensive error handling for:

- Insufficient balance
- Invalid amounts
- Network errors
- Contract errors
- Bridge failures

## Development

To extend the MPB functionality:

1. Update contract addresses in `react.ts`
2. Add new chain support in the constants
3. Extend the UI components for new features
4. Update the explorer link functions for new chains

## Testing

Use the provided stories to test the MPB functionality:

- `MPBBridgeController.stories.tsx` - Test the main bridge controller
- `MPBBridge.stories.tsx` - Test individual bridge components

## Bridge Providers

### LayerZero

- **Pros**: Fast finality, low fees, native integration
- **Cons**: Limited chain support
- **Best for**: High-frequency, low-value transfers

### Axelar

- **Pros**: Wide chain support, mature ecosystem
- **Cons**: Higher fees, slower finality
- **Best for**: Cross-chain DeFi, large transfers

## Security Considerations

- All bridge transactions require user approval
- Fees are calculated dynamically to prevent front-running
- Bridge limits are enforced to prevent abuse
- Transaction status is tracked across both source and target chains
