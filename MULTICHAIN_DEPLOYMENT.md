# 🌐 Multi-Chain Token Deployment Guide

Comprehensive guide for deploying TokenBot (TBOT) across Ethereum, Base, and Solana with native bridge support and Wormhole integration.

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

| Chain       | Token Type       | Creation Method | When Created    |
| ----------- | ---------------- | --------------- | --------------- |
| Ethereum L1 | ERC-20 (Origin)  | Deploy script   | Immediately     |
| Base L2     | ERC-20 (Bridged) | Base Bridge     | First bridge tx |
| Solana      | SPL Token        | Manual/Script   | Before bridging |

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

### 2. Multi-Chain Deployment (Recommended)

```bash
# Interactive setup
npm run setup

# Deploy to all chains at once
npm run deploy:mainnet

# Or for testnet
npm run deploy:testnet
```

This automated deployment:

- Deploys TokenBotL1 to Ethereum
- Calculates Base L2 address
- Creates SPL token on Solana
- Saves all addresses to `deployments/multichain-addresses.json`

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
   # Verify Ethereum L1
   npm run verify:l1:mainnet -- <L1_ADDRESS>

   # Verify Base L2 (after first bridge)
   npm run verify:l2:mainnet -- <L2_ADDRESS>

   # Or batch verify
   npm run verify:batch:mainnet
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

| Network   | Action                    | Estimated Cost           | Notes                                         |
| --------- | ------------------------- | ------------------------ | --------------------------------------------- |
| Ethereum  | Deploy TokenBotL1         | ~0.05 ETH                | Includes contract deployment + initialization |
| Solana    | Create SPL Token          | ~0.01 SOL                | Token creation + metadata                     |
| Ethereum  | Wormhole Registration     | ~0.02 ETH                | Plus gas fees                                 |
| Base      | First Bridge (creates L2) | ~0.01 ETH                | Automatic token creation                      |
| **Total** | **All Networks**          | **~0.08 ETH + 0.01 SOL** | At current prices                             |

## Security Considerations

### Pre-Deployment

1. ✅ Run full test suite: `npm test` (78 tests)
2. ✅ Check coverage: `npm run test:coverage` (100% required)
3. ✅ Run security analysis: `npm run security:check`
4. ✅ Test on all testnets first
5. ✅ Use hardware wallet for deployment

### During Deployment

1. 🔒 Deploy from secure, air-gapped environment
2. 🔒 Verify contract source code immediately
3. 🔒 Double-check all addresses before proceeding
4. 🔒 Monitor transactions for anomalies

### Post-Deployment

1. 📝 Document all addresses publicly
2. 📝 Update project documentation
3. 📝 Set up monitoring and alerts
4. 📝 Test bridge functionality with small amounts
5. 📝 Prepare incident response plan

### Key Management

- Never share private keys
- Use multisig for owner functions
- Rotate keys after deployment
- Store backups securely
