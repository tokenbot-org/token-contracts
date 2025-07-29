# TokenBot Deployment Guide

This guide explains how to deploy the TokenBot ERC-20 contract to Base network using Hardhat.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Git**
3. **Base ETH** for gas fees (on testnet or mainnet)

## Setup Instructions

### 1. Install Dependencies

```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install --save-dev @openzeppelin/contracts
```

### 2. Project Structure

Ensure your project has the following structure:
```
tokenbot-base-contracts/
├── contracts/
│   ├── TokenBotL1.sol    # Ethereum L1 contract
│   └── TokenBotL2.sol    # Base L2 contract
├── scripts/
│   ├── deploy.js         # L2 deployment
│   └── deployL1.js       # L1 deployment
├── hardhat.config.js
├── package.json
├── DEPLOYMENT.md
└── BRIDGE_GUIDE.md       # L1-L2 bridging guide
```

### 3. Compile the Contract

```bash
npx hardhat compile
```

## Deployment

### Deploy TokenBot L1 (Ethereum)

#### Testnet (Goerli)
```bash
npm run deploy:l1:testnet
```

#### Mainnet
```bash
npm run deploy:l1:mainnet
```

### Deploy TokenBot L2 (Base) - Alternative Option

#### Base Goerli Testnet
```bash
npm run deploy:l2:testnet
```

#### Base Mainnet
```bash
npm run deploy:l2:mainnet
```

**Note:** For bridging functionality, deploy to L1 first. The Base bridge will automatically handle L2 representation.

## Important Notes

### Private Key Security

- **NEVER** hardcode your private key in any file
- **NEVER** commit your private key to version control
- The deployment script will prompt you to enter your private key at runtime
- Your input will be hidden (masked with asterisks) for security

### Network Requirements

#### Base Goerli Testnet
- Chain ID: 84531
- RPC URL: https://goerli.base.org
- Explorer: https://goerli.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

#### Base Mainnet
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- Explorer: https://basescan.org
- Bridge: https://bridge.base.org

### Gas Requirements

- Ensure your wallet has sufficient ETH for deployment
- Typical deployment cost: ~0.01-0.02 ETH (varies with gas prices)
- Base has low gas fees compared to Ethereum mainnet

## Post-Deployment

### 1. Verify Contract (Optional but Recommended)

First, add your Basescan API key to `hardhat.config.js`:

```javascript
etherscan: {
  apiKey: {
    baseTestnet: "YOUR_ACTUAL_BASESCAN_API_KEY",
    baseMainnet: "YOUR_ACTUAL_BASESCAN_API_KEY"
  }
}
```

Then verify:

```bash
npx hardhat verify --network baseMainnet YOUR_CONTRACT_ADDRESS
```

### 2. Contract Management

After deployment, you can:
- Transfer ownership: `transferOwnership(newOwnerAddress)`
- Pause transfers: `pause()` (only owner)
- Unpause transfers: `unpause()` (only owner)
- Users can burn tokens: `burn(amount)`

### 3. Add Token to Wallets

To add TokenBot to MetaMask or other wallets:
- Token Address: [Your deployed contract address]
- Token Symbol: TBOT
- Decimals: 18

## Troubleshooting

### "Insufficient balance" Error
- Ensure your wallet has ETH on the correct network
- Check you're deploying to the intended network

### "Invalid private key format" Error
- Private key should be 64 hex characters
- Can be with or without '0x' prefix
- Example: `0x1234567890abcdef...` or `1234567890abcdef...`

### Transaction Timeout
- Base network may be congested
- Try increasing gas price in hardhat.config.js
- Wait and retry

### Compilation Errors
- Ensure Solidity version 0.8.20 is specified
- Run `npx hardhat clean` then `npx hardhat compile`

## Security Best Practices

1. **Use a dedicated deployment wallet** - Don't use your main wallet
2. **Test on testnet first** - Always deploy to Base Goerli before mainnet
3. **Verify your contract** - Allows public code inspection
4. **Transfer ownership** - Consider using a multisig wallet for ownership
5. **Monitor your contract** - Set up alerts for unusual activity

## Support

- Base Documentation: https://docs.base.org
- Base Discord: https://discord.gg/buildonbase
- Hardhat Documentation: https://hardhat.org/docs