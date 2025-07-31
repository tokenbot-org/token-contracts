# 🔍 Contract Verification Guide

This guide explains how to verify TokenBot smart contracts on block explorers.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Verification](#manual-verification)
- [Batch Verification](#batch-verification)
- [Troubleshooting](#troubleshooting)
- [API Keys Setup](#api-keys-setup)

## 🎯 Overview

Contract verification publishes the source code on block explorers, allowing users to:
- Read and verify the contract code
- Interact with contract functions through the explorer UI
- Build trust and transparency
- Enable better integration with DeFi tools

### Supported Networks

| Network | Explorer | API Key Required |
|---------|----------|------------------|
| Ethereum Mainnet | [Etherscan](https://etherscan.io) | `ETHERSCAN_API_KEY` |
| Sepolia Testnet | [Sepolia Etherscan](https://sepolia.etherscan.io) | `ETHERSCAN_API_KEY` |
| Base Mainnet | [Basescan](https://basescan.org) | `BASESCAN_API_KEY` |
| Base Sepolia | [Base Sepolia Scan](https://sepolia.basescan.org) | `BASESCAN_API_KEY` |

## 📝 Prerequisites

### 1. API Keys

Get your API keys from the respective explorers:

**Etherscan (for Ethereum networks):**
1. Visit [etherscan.io/apis](https://etherscan.io/apis)
2. Create a free account
3. Generate an API key

**Basescan (for Base networks):**
1. Visit [basescan.org/apis](https://basescan.org/apis)
2. Create a free account  
3. Generate an API key

### 2. Environment Variables

Set up your API keys in environment variables:

```bash
# For Ethereum networks
export ETHERSCAN_API_KEY="your_etherscan_api_key_here"

# For Base networks
export BASESCAN_API_KEY="your_basescan_api_key_here"
```

Or create a `.env` file in the project root:

```bash
# .env file
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

## 🚀 Quick Start

### Single Contract Verification

Use the npm scripts for easy verification:

```bash
# L1 Contract (Ethereum)
npm run verify:l1:mainnet <contract_address> TokenBotL1
npm run verify:l1:testnet <contract_address> TokenBotL1

# L2 Contract (Base)
npm run verify:l2:mainnet <contract_address> TokenBotL2
npm run verify:l2:testnet <contract_address> TokenBotL2
```

**Example:**
```bash
npm run verify:l1:mainnet 0x742d35cc6464c9532...8df31fa93 TokenBotL1
```

### Batch Verification

Verify multiple contracts at once:

```bash
# Update contract addresses in scripts/verifyBatch.js first
npm run verify:batch:mainnet        # Ethereum mainnet
npm run verify:batch:testnet        # Ethereum testnet
npm run verify:batch:base:mainnet   # Base mainnet
npm run verify:batch:base:testnet   # Base testnet
```

## 🔧 Manual Verification

### Using Hardhat Verify Plugin

```bash
# Basic verification
npx hardhat verify --network <network> <contract_address>

# With specific contract
npx hardhat verify --network <network> <contract_address> --contract "contracts/TokenBotL1.sol:TokenBotL1"

# Examples
npx hardhat verify --network mainnet 0x742d35cc6464c9532...8df31fa93
npx hardhat verify --network baseMainnet 0x123abc...def456
```

### Using Custom Scripts

```bash
# Single contract verification
npx hardhat run scripts/verify.js --network <network> <contract_address> [contract_name]

# Batch verification
npx hardhat run scripts/verifyBatch.js --network <network>
```

## 📦 Batch Verification

### Setup Contract Addresses

Edit `scripts/verifyBatch.js` and update the contract addresses:

```javascript
const CONTRACTS = {
  mainnet: {
    TokenBotL1: "0x742d35cc6464c9532...8df31fa93" // Your actual L1 address
  },
  baseMainnet: {
    TokenBotL2: "0x123abc...def456" // Your actual L2 address (if deployed)
  },
  // ... other networks
};
```

### Run Batch Verification

```bash
# Verify all contracts on mainnet
npm run verify:batch:mainnet

# Verify all contracts on Base mainnet  
npm run verify:batch:base:mainnet
```

The script will:
- Verify each configured contract
- Wait between verifications to avoid rate limiting
- Provide a summary of results
- Show block explorer links

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Already Verified" Error
```
Error: Already Verified
```
**Solution:** The contract is already verified. This is not an error!

#### 2. API Key Issues
```
Error: Invalid API Key
```
**Solutions:**
- Check your API key is correct
- Ensure environment variables are set
- Verify you're using the right API key for the network

#### 3. Contract Not Found
```
Error: Contract source code not verified
```
**Solutions:**
- Wait a few minutes after deployment before verifying
- Ensure the contract address is correct
- Check you're on the right network

#### 4. Compilation Mismatch
```
Error: Fail - Unable to verify
```
**Solutions:**
- Ensure the exact same Solidity version was used
- Check compiler settings match exactly
- Verify constructor arguments are correct

### Debugging Steps

1. **Check Network:**
   ```bash
   npx hardhat network
   ```

2. **Verify API Keys:**
   ```bash
   echo $ETHERSCAN_API_KEY
   echo $BASESCAN_API_KEY
   ```

3. **Test Connection:**
   ```bash
   # Test Etherscan API
   curl "https://api.etherscan.io/api?module=account&action=balance&address=0x742d35cc6464c9532...8df31fa93&tag=latest&apikey=$ETHERSCAN_API_KEY"
   ```

4. **Manual Verification:**
   Try verifying through the block explorer web interface

## 🔑 API Keys Setup

### Environment Variables Method

**Linux/macOS:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ETHERSCAN_API_KEY="your_etherscan_api_key"
export BASESCAN_API_KEY="your_basescan_api_key"

# Reload shell
source ~/.bashrc
```

**Windows (PowerShell):**
```powershell
# Set environment variables
$env:ETHERSCAN_API_KEY="your_etherscan_api_key"
$env:BASESCAN_API_KEY="your_basescan_api_key"

# Or set permanently
[Environment]::SetEnvironmentVariable("ETHERSCAN_API_KEY", "your_key", "User")
[Environment]::SetEnvironmentVariable("BASESCAN_API_KEY", "your_key", "User")
```

### .env File Method

Create `.env` in project root:
```bash
# TokenBot Environment Variables
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: Private keys for deployment (use with caution)
# PRIVATE_KEY=your_private_key_here
```

**Important:** Add `.env` to `.gitignore` to avoid committing secrets!

## 📊 Verification Checklist

### Before Verification
- [ ] Contract is deployed and confirmed
- [ ] API keys are set up correctly
- [ ] Waited at least 1-2 minutes after deployment
- [ ] Have the exact contract address

### During Verification
- [ ] Using correct network flag
- [ ] Contract address is accurate
- [ ] Constructor arguments match (if any)
- [ ] Compiler settings are identical

### After Verification
- [ ] Contract shows "Verified" on block explorer
- [ ] Source code is readable
- [ ] Contract functions are accessible
- [ ] ABI is available for integrations

## 🔗 Explorer Links

After successful verification, your contracts will be available at:

### Ethereum Networks
- **Mainnet:** `https://etherscan.io/address/<contract_address>#code`
- **Sepolia:** `https://sepolia.etherscan.io/address/<contract_address>#code`

### Base Networks  
- **Base Mainnet:** `https://basescan.org/address/<contract_address>#code`
- **Base Sepolia:** `https://sepolia.basescan.org/address/<contract_address>#code`

## 📞 Support

### Getting Help

**Documentation:**
- [Hardhat Verification Docs](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan)
- [Etherscan API Docs](https://docs.etherscan.io/)
- [Basescan API Docs](https://docs.basescan.org/)

**Common Resources:**
- Hardhat Discord: [discord.gg/hardhat](https://discord.gg/hardhat)
- TokenBot Issues: [GitHub Issues](https://github.com/tokenbot-org/token-contracts/issues)

### Emergency Contacts

If verification is blocking a critical deployment:
- **Technical Support:** dev@tokenbot.com
- **Security Issues:** security@tokenbot.com

---

**Document Version:** 1.0.0  
**Last Updated:** [Current Date]  
**Next Review:** [Date + 1 month]