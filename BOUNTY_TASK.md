# Bounty Objective: [GoodBounty-QA]: Testing of reserve swapping with delegation marked wallets
Target: GoodDollar/GoodWeb3-Mono Issue #275
URL: https://github.com/GoodDollar/GoodWeb3-Mono/issues/275

## Issue Description
# Reserve QA: Mono #274 + Protocol UI #645

Test the prepared GoodProtocolUI app locally and submit a short report for both PRs. No code changes or new test tools are part of this assignment.

QA-Bounty: 200.000G$

A generic template can be seen here to file your reports; https://github.com/GoodDollar/.github/blob/master/.github/ISSUE_TEMPLATE/GoodBounties-QA-Template.md

you can also check a recent QA report flow in this pull-request and what is expected: https://github.com/GoodDollar/GoodSDKs/pull/69

## Before starting

The main QA checks below are desktop only. A separate mobile-screen layout check is included for the forced Reserve-limit modal.
Its mainly testing the fixes applied through https://github.com/GoodDollar/GoodWeb3-Mono/pull/274 that should resolve
some delegation marker handling, rate and trade limits messaging.

**This QA bounty can only be picked up by someone who has a delegation marker on their wallet on at least Celo.
you can check your address using this tool: https://eip7702.app/
It shows for your wallet and which chains have a delegation marker.
This can be applied when you have used your wallet with metamask and for example have used 'stable coin gas payments'**

## Local package setup

The packages are not published to npm yet. Test the paired branches using yalc; the SDKs will be published and ProtocolUI upgraded before merge.

Validated source pair:
- GoodWeb3-Mono: `958b5cdc1e561c12c94ac5c141cb2764daa19e37` on `reserve-and-bridge-fixes`
- GoodProtocolUI: `ac50050a585a12eeb90401d888735c34f2431635` on `reserve-and-rpc-fixes`

Use Node 24 (validation used 24.18.0), Yarn 3.6.1 and an available `yalc` command. Clone the repositories if needed; in existing clean QA checkouts, fetch, switch to the named branch and pull before continuing. Record the commits you actually test.

Mono currently pins Yarn 3.2.1. In each QA checkout, select 3.6.1 explicitly:

```sh
corepack enable
yarn set version 3.6.1
yarn --version
```

The version-selection command follows [Yarn's documented setup](https://yarnpkg.com/cli/set/version). It can change local package-manager metadata. Keep setup/yalc/lockfile changes local; no code-change PR is required for this bounty.

From the GoodWeb3-Mono root:

```sh
yarn install
yarn install --immutable
cd packages/sdk-v2
yarn build
cd ../good-design
yalc add -D @gooddollar/web3sdk-v2
yarn build
```

The first install intentionally allows the Yarn 3.6.1 lockfile update; starting with `--immutable` failed in the clean validation checkout. The subsequent immutable install passed. Both package build scripts already publish to the local yalc store, so no separate publish command is needed.

From the GoodProtocolUI root, after those builds:

```sh
yalc add @gooddollar/web3sdk-v2 @gooddollar/good-design
yarn install
yarn install --immutable
yarn build
```

Add the yalc packages **before the first install**: this branch already has `file:.yalc` dependencies. The production build is a sanity check, not how you run the QA override. Use `yarn start` for the checks below.

## Setup and safety

1. For checks 1–2, leave `REACT_APP_QA_FORCE_TRADE_LIMITS` unset or `false`. Start the app with `yarn start` and open http://localhost:3000 on desktop.
2. Connect your test wallet and select Celo. Record the browser, operating system and both repository commit IDs (`git rev-parse HEAD` in each repository), plus the installed package versions.
3. Open Swap and select Reserve.

Use an empty test wallet for read-only checks. Do not fund it, approve tokens, sign messages or send transactions. If a signing request appears, stop and record which action opened it.

The implemented configuration below provides one forced Reserve-limit flow. No mock wallet, quote fixture or other transaction/error scenarios are supplied. Do not write code, build simulations, induce RPC outages or create failures yourself.

## Desktop checks you can run now

### 1. Reserve quotes and form updates

1. On Celo, record the displayed Reserve token pair and network.
2. Enter `1` of the input token and wait for the quote to finish loading. Save the input/output amounts, minimum received, price, token labels, balance and any funding/approval warning.
3. Change the input to `2`. Check that the quote updates and does not retain the previous amount.
4. Reverse buy/sell, enter `1` again and repeat. Check that token labels, decimals and quote belong to the selected direction.
5. With zero balance, check that the app prevents submitting a swap. Do not click Approve or try to get past this restriction.

Save screenshots for both directions. If a pair or quote is unavailable, record the exact network, pair, amount and error instead of inventing an expected result. This checks loading and consistency; without an independent reference quote, do not claim the numerical rate has been independently verified.

### 2. Swap and Microbridge read-only regression

1. Reopen Swap, then Microbridge. Check that the forms load without an app error.
2. In Microbridge, inspect the available Celo/Fuse selections and displayed balances. Record loading or network errors.
3. Disconnect and reconnect the test account. If you have a second test account, switch to it and check that balances and visible history belong to the selected account, not the previous one.
4. Check the history view. An empty account should show an appropriate empty state rather than another account's records.

Do not start a Microbridge transfer. Its first transaction can move funds; it is not just a token approval.

Save screenshots. If no second account is available, mark account-switching Not run. No history account or expected transaction list is supplied: report existing-history accuracy as Blocked unless you can compare records belonging to your own test account with known transactions. Passing the empty state does not verify existing-history accuracy.

## Forced Reserve-limit flow

### 3. Desktop limit message, close/reopen and links

In the GoodProtocolUI root, add this line to `.env.local`:

```dotenv
REACT_APP_QA_FORCE_TRADE_LIMITS=true
```

Stop and restart `yarn start`. This works only in a development build; production builds ignore it. Leave `REACT_APP_NETWORK` unchanged: that selects contract deployments, not the QA build mode.

1. Open Swap → Reserve and connect your empty test wallet on Celo.
2. Enter an amount, for example `1` of the displayed input token, and wait for a valid nonzero quote. Quotes are normal read-only RPC reads; a token balance or approval is not required to obtain one.
3. Confirm that **QA simulation: Reserve limit** replaces the real Approve/Swap actions. Your displayed balance must remain real, not a fabricated balance.
4. Click **QA simulation: Reserve limit**. In the confirmation, check the QA notice and click **SIMULATE RESERVE LIMIT**. No approval, wallet signature or transaction should be requested. The SDK injects the limit error before signer access and routes it through the existing error classifier.
5. Check that confirmation closes and **Reserve limit reached** identifies Celo. Open Uniswap and Ubeswap links only to inspect their destinations. Save the modal and final URLs; do not connect a wallet or trade there.
6. Close the modal and repeat. Check for stale errors reopening on their own. Check that dragging does not dismiss swap confirmation.
7. Switch to XDC, obtain a valid Reserve quote and repeat. The limit message must identify XDC and provide the XSwap link.

The simulation still requires a connected account, supported network and valid live quote. It bypasses balance/allowance gating only for the labelled QA path. If the quote cannot load, the QA label does not appear, or the paired SDK capability is inactive, mark the check Blocked and record the commit/package versions, network, pair, amount and visible error. Do not fund the wallet, approve tokens or substitute a self-built fixture to proceed.

Record any alternative-network suggestion that appears, then close/reopen, switch networks and wait at least 15 seconds to check for stale suggestions. Do not claim all availability branches were tested: a live result or DEX link does not prove alternative liquidity, and no deterministic available/unavailable fixtures are supplied.

To disable: set `REACT_APP_QA_FORCE_TRADE_LIMITS=false` or remove that line, then stop and restart `yarn start`. Check that the QA label disappears and ordinary empty-wallet balance/allowance restrictions return. Do not send a transaction.

Save a short recording. This verifies injected error handling and presentation, not a genuine on-chain trade limit.

### 4. Separate mobile-screen layout check

With the same QA configuration enabled, use desktop browser responsive mode at **375 × 812** and repeat the forced modal on Celo and XDC. Record the browser and viewport; label the result as emulated, not a physical-device test.

Check that the title, explanation and DEX links fit, there is no horizontal clipping, scrolling works if needed, and the close control remains visible and usable. Close and reopen the modal and save screenshots for both networks. Do not sign or send anything. This is a layout check only, not mobile transaction QA.

## Preparation verified; tester report still required

The paired SDK/design/UI builds and UI typecheck passed locally, along with 6 focused SDK and 19 focused UI tests. SDK activation/off/production guards were checked in a browser. A coupled UI/SDK test with mocked account/quote inputs exercised two modal cycles per chain without signer/transaction calls; the actual design modal was also checked at 375 × 812. These test inputs are not a packaged tester scenario.

The complete connected-wallet browser flow remains the tester's work. This does not establish live trade limits, delegated transaction execution, receipts, history accuracy or alternative liquidity. Two broader SDK Jest suites still fail on React Native imports; the full SDK suite is not claimed green. Fresh dependency trees were validated using warm package caches, not a clean internet download.

## Coverage not established by this bounty's current no-signing checks

Do not mark the following as passed based on quotes, wallet connection or the forced limit modal:

- Real approval and swap submission, waiting/pending states and success only after a successful receipt.
- Delegated-wallet transaction execution without incorrect Safe detection. Wallet eligibility/connection alone does not prove this fix.
- Wallet rejection, approval failure, mined swap failure and their retry/reset behaviour.
- Deterministic alternative-network availability/unavailability branches.
- Full Microbridge transfer, receipt confirmation or destination settlement.

These require separate safe test support or a separately agreed live-transaction QA scope. Live transactions are out of scope here. Record the coverage gaps explicitly; do not create scenarios or transact to fill them.

## Report and completion

Record Pass, Fail, Blocked or Not run for each check; include exact pair/package versions, browser/device, setup commands, screenshots/recordings and expected versus actual behavior. Remove secrets. Submit one report linking both PRs, with Ready or Hold and remaining gaps. Checks blocked by unavailable quotes, setup or other missing support remain Blocked; they are not passes. List out-of-scope transaction coverage separately. A partial read-only report does not establish full transaction readiness. QA does not authorize merge or deployment.

Sources: https://github.com/GoodDollar/GoodWeb3-Mono/pull/274 | https://github.com/GoodDollar/GoodProtocolUI/pull/645 | https://github.com/GoodDollar/GoodProtocolUI/actions/runs/38226103620/job/114733880326

## Instructions for Kuro (Autonomous Solver):
1. Use skills: `systematic-debugging` and `code-review-and-quality`.
2. Inspect the repository structure, locate relevant files, and understand the bug/feature.
3. Apply the minimal, robust fix or implementation.
4. Run any existing test suites or linters in the workspace.
5. Ensure the fix adheres to the project's existing code style.
6. When done, output a summary of files modified and verification results.
