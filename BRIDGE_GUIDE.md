# 🌉 TokenBot Cross-Chain Bridge Guide

Comprehensive guide for bridging TokenBot (TBOT) between Ethereum L1, Base L2, and Solana using native bridges and Wormhole.

## Overview

TokenBot supports multiple bridge solutions for cross-chain transfers:

### Base Bridge (Ethereum ↔ Base)

- Native, secure bridge solution
- Automatic L2 token creation
- No additional deployment needed

### Wormhole (Ethereum ↔ Solana)

- Cross-chain messaging protocol
- Supports SPL token wrapping
- Requires token registration

## Architecture

```
       Ethereum L1 (Origin)
              │
       ┌──────┴──────┐
       │             │
   Base L2       Solana
 (Base Bridge)  (Wormhole)
       │             │
Auto-created    SPL Token
```

### Bridge Flow Diagram

```
Ethereum L1                    Base L2                    Solana
┌─────────────┐               ┌─────────────┐           ┌─────────────┐
│ TokenBotL1  │               │ L2 TBOT     │           │ Wrapped     │
│   (TBOT)    │◄─────────────►│ (Auto-      │◄─────────►│ TBOT (SPL)  │
│             │  Base Bridge   │  created)   │ Wormhole  │   Token     │
└─────────────┘               └─────────────┘           └─────────────┘
```

## Deployment Steps

### Option 1: Multi-Chain Deployment (Recommended)

```bash
# Deploy to all chains at once
npm run deploy:mainnet

# Or for testnet
npm run deploy:testnet
```

### Option 2: Individual Deployment

#### Deploy to Ethereum L1

```bash
# Mainnet
npm run deploy:l1:mainnet

# Testnet (Sepolia)
npm run deploy:l1:testnet
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

| Route             | Direction    | Time         | Notes                     |
| ----------------- | ------------ | ------------ | ------------------------- |
| Ethereum → Base   | Deposit      | ~1-3 minutes | Fast, automatic           |
| Base → Ethereum   | Withdraw     | ~7 days      | Security challenge period |
| Ethereum → Solana | Via Wormhole | ~15 minutes  | Requires confirmations    |
| Solana → Ethereum | Via Wormhole | ~15 minutes  | Requires confirmations    |

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

## Solana Bridge (via Wormhole)

### Setup

1. **Register Token with Wormhole**
   - Visit https://portalbridge.com
   - Click "Register Token"
   - Enter Ethereum TBOT address
   - Confirm transaction

2. **Bridge Tokens**
   - Select source chain (Ethereum/Base)
   - Select destination (Solana)
   - Enter amount
   - Approve and confirm

### Solana Bridge Considerations

- **Decimals**: Ethereum uses 18, Solana uses 9
- **Fees**: Small Wormhole fee + gas
- **Time**: ~15 minutes for finality
- **Wrapping**: Creates wrapped SPL token

## Bridge Comparison

| Feature          | Base Bridge       | Wormhole            |
| ---------------- | ----------------- | ------------------- |
| Networks         | ETH ↔ Base       | ETH ↔ Solana       |
| Speed (Deposit)  | 1-3 min           | ~15 min             |
| Speed (Withdraw) | 7 days            | ~15 min             |
| Fees             | Gas only          | Gas + bridge fee    |
| Token Creation   | Automatic         | Manual registration |
| Security Model   | Optimistic rollup | Guardian network    |

## Resources

### Base Bridge

- Bridge UI: https://bridge.base.org
- Documentation: https://docs.base.org/guides/bridge-tokens
- Status: https://status.base.org
- Support: https://help.coinbase.com/en/base

### Wormhole Bridge

- Portal Bridge: https://portalbridge.com
- Documentation: https://docs.wormhole.com
- Explorer: https://wormholescan.io
- Support: https://discord.gg/wormhole

### Contract Addresses

- See [MULTICHAIN_DEPLOYMENT.md](./MULTICHAIN_DEPLOYMENT.md) for all addresses
- Check `deployments/` folder for latest deployments
