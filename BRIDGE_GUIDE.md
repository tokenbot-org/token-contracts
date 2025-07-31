# TokenBot L1-L2 Bridge Guide

This guide explains how to deploy and use TokenBot (TBOT) across Ethereum L1 and Base L2 using the native Base Bridge.

## Overview

The native Base Bridge approach allows seamless token transfers between Ethereum mainnet (L1) and Base (L2):

- Deploy TBOT on Ethereum L1 first
- Base Bridge automatically creates the L2 representation
- Users can bridge tokens in both directions

## Architecture

```
Ethereum L1                    Base L2
┌─────────────┐               ┌─────────────┐
│ TokenBotL1  │               │ L2 TBOT     │
│   (TBOT)    │◄─────────────►│ (Auto-      │
│             │  Base Bridge   │  created)   │
└─────────────┘               └─────────────┘
```

## Deployment Steps

### 1. Deploy to Ethereum L1

#### Testnet (Sepolia)

```bash
npm run deploy:l1:testnet
```

#### Mainnet

```bash
npm run deploy:l1:mainnet
```

### 2. Bridge Setup

After L1 deployment, the Base Bridge automatically:

- Detects your L1 token
- Creates the corresponding L2 token on Base
- Sets up the bridge contracts

No additional deployment needed on L2!

## How to Bridge Tokens

### Using Base Bridge UI

1. Visit https://bridge.base.org
2. Connect your wallet
3. Select "Deposit" (L1 → L2) or "Withdraw" (L2 → L1)
4. Add TBOT token:
   - Enter the L1 TBOT contract address
   - The bridge will auto-detect token details
5. Enter amount to bridge
6. Approve and confirm transaction

### Bridge Timing

- **L1 → L2 (Deposit)**: ~1-3 minutes
- **L2 → L1 (Withdraw)**: ~7 days (challenge period)

### Programmatic Bridging

#### Deposit (L1 → L2)

```javascript
// Example code for depositing TBOT from L1 to L2
const L1StandardBridge = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35"; // Base L1 Bridge
const l1Token = "YOUR_L1_TBOT_ADDRESS";
const l2Token = "AUTO_CREATED_L2_ADDRESS"; // Get from Base Bridge
const amount = ethers.parseEther("100"); // 100 TBOT

// 1. Approve bridge to spend tokens
await tbot.approve(L1StandardBridge, amount);

// 2. Bridge tokens
await bridge.depositERC20(
  l1Token,
  l2Token,
  amount,
  200000, // L2 gas limit
  "0x" // Extra data
);
```

## Finding Your L2 Token Address

After first bridge transaction:

1. Check transaction on Base Bridge UI
2. Or query the L2 bridge:
   ```javascript
   const L2StandardBridge = "0x4200000000000000000000000000000000000010";
   // Call l2TokenAddress = bridge.l1ToL2Token(l1TokenAddress)
   ```

## Important Addresses

### Base Bridge Contracts

#### Mainnet

- L1 Standard Bridge: `0x3154Cf16ccdb4C6d922629664174b904d80F2C35`
- L2 Standard Bridge: `0x4200000000000000000000000000000000000010`

#### Testnet (Sepolia → Base Sepolia)

- L1 Standard Bridge: `0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a`
- L2 Standard Bridge: `0x4200000000000000000000000000000000000010`

## Security Considerations

1. **First Deployment**: Always test on testnet first
2. **Bridge Limits**: Some bridges have deposit limits
3. **Gas Costs**: Ensure sufficient ETH on both chains
4. **Withdrawal Time**: L2→L1 takes 7 days for security

## Troubleshooting

### "Token not found" on Bridge UI

- Ensure L1 token is deployed and verified
- Try refreshing or manually adding token address

### High gas fees

- Bridge during low network congestion
- Adjust gas settings in wallet

### Transaction stuck

- Check Etherscan/Basescan for status
- May need to wait for network confirmation

## Resources

- Base Bridge: https://bridge.base.org
- Base Docs: https://docs.base.org/guides/bridge-tokens
- Bridge Status: https://status.base.org
- Support: https://help.coinbase.com/en/base
