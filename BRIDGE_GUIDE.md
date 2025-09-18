# TokenBot Bridge Guide

## Supported Bridges

### Base Bridge (Ethereum ↔ Base)
- **UI**: https://bridge.base.org
- **Time**: 1-3 min deposit, 7 days withdrawal
- **L2 Token**: Auto-created on first bridge

### Wormhole (Ethereum ↔ Solana)
- **UI**: https://portalbridge.com
- **Time**: ~15 minutes both ways
- **SPL Token**: Auto-created by Wormhole on first bridge

## How to Bridge

### Ethereum → Base

1. Visit https://bridge.base.org
2. Connect wallet
3. Select "Deposit"
4. Add TBOT token address
5. Enter amount and confirm

### Base → Ethereum

1. Visit https://bridge.base.org
2. Select "Withdraw"
3. Enter amount
4. Wait 7 days for security period

### Ethereum → Solana

1. Visit https://portalbridge.com
2. Register Ethereum token (one-time)
3. Select Ethereum as source, Solana as destination
4. Enter amount and confirm
5. Wormhole creates wrapped SPL token automatically
6. Wait ~15 minutes

## Bridge Contracts

### Base Mainnet
- L1 Bridge: `0x3154Cf16ccdb4C6d922629664174b904d80F2C35`
- L2 Bridge: `0x4200000000000000000000000000000000000010`

### Base Testnet (Sepolia)
- L1 Bridge: `0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a`
- L2 Bridge: `0x4200000000000000000000000000000000000010`

## Programmatic Bridging

```javascript
// Deposit L1 → L2
const bridge = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
const amount = ethers.parseEther("100");

// Approve
await tbot.approve(bridge, amount);

// Bridge
await bridge.depositERC20(
  l1Token,
  l2Token,
  amount,
  200000, // L2 gas limit
  "0x"
);
```

## Notes

- Both Base and Solana tokens are created automatically on first bridge
- No manual token deployment needed on L2 chains
- Withdrawals from Base take 7 days (security period)
- Solana wrapped token uses 9 decimals vs Ethereum's 18
- Always test with small amounts first