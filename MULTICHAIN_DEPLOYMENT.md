# Multi-Chain Token Deployment Guide

This guide explains how to deploy TBOT across Ethereum, Base, and Solana with bridge support.

## Overview

```
    Ethereum L1 (Origin)
           │
    ┌──────┴──────┐
    │             │
Base L2      Solana
(Auto)       (Manual)
```

## What Gets Created

| Chain | Token Type | Creation Method | When Created |
|-------|------------|-----------------|--------------|
| Ethereum L1 | ERC-20 (Origin) | Deploy script | Immediately |
| Base L2 | ERC-20 (Bridged) | Base Bridge | First bridge tx |
| Solana | SPL Token | Manual/Script | Before bridging |

## Address Determinism

### Base L2 Address
- **Deterministic**: Yes
- **Formula**: `CREATE2(bridge, hash(l1Token, l2Bridge), bytecode)`
- **Can predict**: Before any bridging occurs

### Solana Address
- **Deterministic**: No
- **Depends on**: Keypair used for creation
- **Must create**: Before users can bridge

## Deployment Process

### 1. Basic Deployment (L1 Only)
```bash
npm run deploy:l1:mainnet
```

### 2. Multi-Chain Deployment
```bash
# Set up environment
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
export SOLANA_PRIVATE_KEY="[...]"  # JSON array format

# Run multi-chain deployment
npx hardhat run scripts/deployMultiChain.js --network mainnet
```

### 3. Manual Solana Setup (Alternative)

If not using the script, create SPL token manually:

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Create token
spl-token create-token --decimals 9

# Create token account
spl-token create-account <TOKEN_ADDRESS>

# Mint initial supply (if needed)
spl-token mint <TOKEN_ADDRESS> 1000000000
```

## Bridge Registration

### Base Bridge
- **Automatic**: No registration needed
- **Token appears**: After first bridge transaction

### Wormhole (Solana)
1. Go to https://portalbridge.com
2. Click "Register Token"
3. Enter Ethereum token address
4. Submit registration transaction
5. Wait for Guardian signatures

## Post-Deployment Steps

1. **Verify Contracts**
   ```bash
   npm run verify:mainnet -- <L1_ADDRESS>
   ```

2. **Update Documentation**
   - Add addresses to README
   - Update bridge guides
   - Create user instructions

3. **Test Bridges**
   - Small test transaction to Base
   - Small test transaction to Solana
   - Verify token appears correctly

## Important Addresses

### Bridge Contracts
```javascript
// Base Bridge
const BASE_L1_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
const BASE_L2_BRIDGE = "0x4200000000000000000000000000000000000010";

// Wormhole
const WORMHOLE_TOKEN_BRIDGE = "0x3ee18B2214AFF97000D974cf647E7C347E8fa585";
```

## Limitations

1. **Cannot pre-create Base L2 token**
   - Controlled by Base bridge
   - Created on first bridge

2. **Cannot automate Wormhole registration**
   - Requires UI interaction
   - Manual guardian approval

3. **Different decimals on Solana**
   - Ethereum/Base: 18 decimals
   - Solana: 9 decimals (standard)
   - Bridges handle conversion

## Cost Estimates

- L1 Deployment: ~0.05 ETH
- Solana Token Creation: ~0.01 SOL
- Wormhole Registration: ~0.02 ETH + gas
- First Base Bridge: ~0.01 ETH (creates L2 token)

## Security Considerations

1. **Deploy from secure wallet**
2. **Verify all addresses before sharing**
3. **Test on testnet first**
4. **Keep deployment keys secure**
5. **Document all addresses publicly**