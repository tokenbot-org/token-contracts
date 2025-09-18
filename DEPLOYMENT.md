# TokenBot (TBOT) Deployment Guide

## Prerequisites

- Node.js v16+
- ETH on Ethereum and Base
- Configured environment variables (run `npm run setup`)

## Quick Deploy

### Testnet
```bash
npm run deploy:testnet
```
Deploys to Sepolia testnet.

### Mainnet
```bash
npm run deploy:mainnet
```
Deploys to Ethereum mainnet.

## What Gets Deployed

1. **Ethereum L1**: TokenBotL1.sol (ERC-20 with 1B supply)
2. **Base L2**: Auto-created when first bridged (no manual deployment)
3. **Solana**: Auto-created when first bridged via Wormhole (no manual deployment)

## Post-Deployment

### Verify Contracts
```bash
# Verify on Ethereum
npm run verify:l1:mainnet -- YOUR_ADDRESS

# Batch verify all
npm run verify:batch:mainnet
```

### Bridge Setup

**Base Bridge**: Use https://bridge.base.org
- L2 token auto-created on first bridge
- No registration needed

**Solana (Wormhole)**: Use https://portalbridge.com
1. Register Ethereum token on Portal
2. Bridge tokens - Wormhole auto-creates SPL token

## Deployment Outputs

Addresses saved to:
- `deployments/multichain-addresses.json`
- `deployments/[network]-[env].json`

## Cost Estimates

| Network  | Action | Cost |
|----------|--------|------|
| Ethereum | Deploy | ~0.05 ETH |
| Base     | First bridge | ~0.01 ETH |
| Solana   | First bridge | ~0.02 ETH (Wormhole fee) |

## Troubleshooting

**Base L2 token not found**: Bridge a small amount first to create it

**Solana token not found**: Register on Wormhole Portal and bridge to create it