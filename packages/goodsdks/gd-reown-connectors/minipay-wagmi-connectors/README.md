# @gooddollar/minipay-wagmi-connector

A [Wagmi connector](https://wagmi.sh/) for interacting with MiniPay wallet.

## Installation

Install and setup wagmi following the [official documentation](https://wagmi.sh/react/getting-started#manual-installation).

```bash
yarn add @gooddollar/minipay-wagmi-connector
```

## Usage

Connect to MiniPay wallet:

```typescript
import { useConnect } from 'wagmi'
import { minipay } from '@gooddollar/minipay-wagmi-connector'

function App() {
  const { connect } = useConnect()

  return (
    <button onClick={() => connect({ connector: minipay() })}>
      Connect MiniPay
    </button>
  )
}
```

## Requirements

- MiniPay wallet must be installed and available in the browser
- The wallet exposes `window.ethereum` with an `isMiniPay` property
- MiniPay is primarily designed for mobile browsers (Opera browser)

## Features

- Full EIP-1193 provider support
- Account management
- Chain switching
- Event handling for account and chain changes
- Automatic detection of MiniPay wallet

