# 🚀 TokenBot Multi-Chain Deployment Guide

This guide explains how to deploy TokenBot (TBOT) simultaneously across Ethereum, Base, and Solana networks.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Git**
3. **Wallets & Funds**:
   - ETH on Ethereum (for deployment + gas)
   - ETH on Base (for bridge fees)
   - SOL on Solana (for token creation)
4. **Environment configured** - Run `npm run setup` or see [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md)

## Multi-Chain Architecture

```
    Ethereum L1 (Origin)
           │
    ┌──────┴──────┐
    │             │
Base L2      Solana
(Auto)      (Created)
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Interactive setup (recommended)
npm run setup

# Or manually configure .env
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
```env
# Ethereum/Base
PRIVATE_KEY="your_ethereum_private_key"
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_KEY"

# Solana
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_PRIVATE_KEY="[byte_array_format]"

# API Keys (for verification)
ETHERSCAN_API_KEY="your_etherscan_key"
BASESCAN_API_KEY="your_basescan_key"
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

## Multi-Chain Deployment

### Testnet Deployment

Deploy to Sepolia (Ethereum), Base Sepolia, and Solana Devnet:

```bash
npm run deploy:multichain:testnet
```

### Mainnet Deployment

Deploy to Ethereum, Base, and Solana mainnet:

```bash
npm run deploy:multichain:mainnet
```

### What Happens During Deployment

1. **Ethereum L1 Deployment**
   - Deploys TokenBotL1.sol
   - Mints total supply to deployer
   - Estimated gas: ~0.05 ETH

2. **Base L2 Address Calculation**
   - Calculates deterministic L2 address
   - Token created automatically on first bridge
   - No deployment needed

3. **Solana SPL Token Creation**
   - Creates SPL token with metadata
   - Sets up mint authority
   - Estimated cost: ~0.01 SOL

4. **Wormhole Registration**
   - Registers Ethereum token with Wormhole
   - Enables ETH ↔ Solana bridging
   - Manual step via Portal UI

5. **Address Storage**
   - Saves all addresses to `deployments/multichain-addresses.json`
   - Includes deployment timestamp

## Post-Deployment Steps

### 1. Verify Contracts

```bash
# Verify Ethereum contract
npm run verify:mainnet -- YOUR_L1_ADDRESS

# Base contract auto-verified when created
```

### 2. Register with Bridges

#### Wormhole (for Solana)
1. Go to https://portalbridge.com
2. Click "Register Token"
3. Enter Ethereum token address
4. Confirm transaction

### 3. Test Bridges

Always test with small amounts first:

```bash
# Base Bridge
https://bridge.base.org

# Wormhole Bridge
https://portalbridge.com
```

### 4. Update Documentation

Update your project README with:
- Ethereum contract address
- Base L2 address (predicted)
- Solana token address
- Bridge instructions

## Deployment Output

After successful deployment, you'll have:

```json
{
  "ethereum": "0x1234...5678",
  "base": "0xABCD...EF01",
  "solana": "7xKXtg...9PQR",
  "deployedAt": "2024-01-20T10:30:00Z"
}
```

## Network Details

### Ethereum Mainnet
- Chain ID: 1
- Explorer: https://etherscan.io

### Base Mainnet
- Chain ID: 8453
- Explorer: https://basescan.org
- Bridge: https://bridge.base.org

### Solana Mainnet
- Cluster: mainnet-beta
- Explorer: https://solscan.io
- Bridge: https://portalbridge.com

## Cost Estimates

| Network | Action | Estimated Cost |
|---------|--------|----------------|
| Ethereum | Deploy L1 | ~0.05 ETH |
| Base | First bridge (creates token) | ~0.01 ETH |
| Solana | Create SPL token | ~0.01 SOL |
| Ethereum | Wormhole registration | ~0.02 ETH |

## Security Checklist

Before mainnet deployment:

- [ ] Test on all testnets
- [ ] Audit contract code
- [ ] Verify deployment wallet security
- [ ] Document all addresses
- [ ] Test bridge functionality
- [ ] Set up monitoring
- [ ] Plan for key management
- [ ] Prepare incident response plan

## Troubleshooting

### "Insufficient funds"
- Check balances on all networks
- Ensure correct network selected

### "Solana key format error"
```bash
# Convert base58 to byte array
solana-keygen pubkey ~/.config/solana/id.json
```

### "Bridge registration failed"
- Wait for Ethereum deployment confirmation
- Try again after 10-20 blocks

### "Base L2 token not found"
- Token created on first bridge
- Bridge a small amount to create

## Support

- Ethereum: https://ethereum.org/developers
- Base: https://docs.base.org
- Solana: https://docs.solana.com
- Wormhole: https://docs.wormhole.com