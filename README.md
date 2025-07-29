# TokenBot (TBOT) Token Contracts

[![CI](https://github.com/tokenbot-org/tokenbot-contracts/workflows/CI/badge.svg)](https://github.com/tokenbot-org/tokenbot-contracts/actions/workflows/ci.yml)
[![Security](https://github.com/tokenbot-org/tokenbot-contracts/workflows/Security/badge.svg)](https://github.com/tokenbot-org/tokenbot-contracts/actions/workflows/security.yml)
[![Coverage](https://github.com/tokenbot-org/tokenbot-contracts/workflows/Coverage/badge.svg)](https://github.com/tokenbot-org/tokenbot-contracts/actions/workflows/coverage.yml)

This repository contains the official TokenBot (TBOT) token contracts supporting both Ethereum L1 and Base L2 with native bridge integration.

## Overview

TokenBot (TBOT) is an ERC-20 token designed for seamless cross-chain operation between Ethereum mainnet and Base L2. The token supports the Base native bridge for secure, decentralized transfers between layers.

### Token Details

- **Name**: TokenBot
- **Symbol**: TBOT
- **Total Supply**: 1,000,000,000 TBOT
- **Decimals**: 18
- **L1 Network**: Ethereum Mainnet
- **L2 Network**: Base

## Architecture

```
Ethereum L1                    Base L2
┌─────────────┐               ┌─────────────┐
│ TokenBotL1  │               │ L2 TBOT     │
│   (TBOT)    │◄─────────────►│ (Auto-      │
│             │  Base Bridge   │  created)   │
└─────────────┘               └─────────────┘
```

## Contracts

### TokenBotL1.sol

- **Purpose**: Primary token contract on Ethereum L1
- **Features**: Burnable, Pausable, Ownable
- **Deployment**: `npm run deploy:l1:mainnet`

### TokenBotL2.sol

- **Purpose**: Alternative deployment for Base L2 (if not using bridge)
- **Features**: Burnable, Pausable, Permit (EIP-2612), Ownable
- **Deployment**: `npm run deploy:l2:mainnet`

## Deployment Strategy

### Recommended: L1 First with Native Bridge

1. Deploy TokenBotL1 on Ethereum mainnet
2. Base bridge automatically creates L2 representation
3. Users bridge tokens via https://bridge.base.org

### Alternative: Direct L2 Deployment

Deploy TokenBotL2 directly on Base L2 for L2-only usage.

## Quick Start

### Prerequisites

- Node.js v16+
- ETH for gas fees on target network

### Installation

```bash
npm install
```

### Testing

```bash
# Test all contracts
npm test

# Test L1 contract only
npm run test:l1

# Test L2 contract only
npm run test:l2

# Generate coverage report
npm run test:coverage

# Generate gas usage report
npm run test:gas
```

### Code Quality

```bash
# Lint all files
npm run lint

# Lint Solidity files only
npm run lint:sol

# Lint JavaScript files only
npm run lint:js

# Auto-fix linting issues
npm run lint:fix

# Format all files
npm run format
```

### Deployment

#### L1 Deployment (Recommended)

```bash
# Testnet
npm run deploy:l1:testnet

# Mainnet
npm run deploy:l1:mainnet
```

#### L2 Deployment (Alternative)

```bash
# Testnet
npm run deploy:l2:testnet

# Mainnet
npm run deploy:l2:mainnet
```

## Bridging

### Using Base Bridge UI

1. Visit https://bridge.base.org
2. Connect your wallet
3. Select TBOT token
4. Enter amount and confirm

### Bridge Timing

- **L1 → L2**: ~1-3 minutes
- **L2 → L1**: ~7 days (security period)

### Programmatic Bridging

See [BRIDGE_GUIDE.md](./BRIDGE_GUIDE.md) for detailed integration examples.

## Features

### Security Features

- **Pausable**: Owner can pause transfers in emergencies
- **Burnable**: Token holders can burn their tokens
- **Ownable**: Administrative controls for owner
- **Standard Compliant**: Full ERC-20 compatibility

### L2 Enhancements (TokenBotL2)

- **Permit (EIP-2612)**: Gasless approvals via signatures
- **Optimized**: Lower gas costs on Base L2

### Bridge Compatibility

- **Base Native Bridge**: Secure, decentralized bridging
- **Automatic L2 Creation**: No manual L2 deployment needed
- **Standard Interface**: Compatible with bridge UIs and tools

## Documentation

- **Full Documentation**: https://docs.tokenbot.com
- **Website**: https://tokenbot.com
- **Bridge Guide**: [BRIDGE_GUIDE.md](./BRIDGE_GUIDE.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Repository Structure

```
├── contracts/
│   ├── TokenBotL1.sol     # Ethereum L1 contract
│   └── TokenBotL2.sol     # Base L2 contract
├── scripts/
│   ├── deployL1.js        # L1 deployment script
│   └── deploy.js          # L2 deployment script
├── test/
│   ├── TokenBotL1.test.js # L1 tests (26 tests)
│   └── TokenBotL2.test.js # L2 tests (21 tests)
├── BRIDGE_GUIDE.md        # Cross-chain bridging guide
└── DEPLOYMENT.md          # Deployment instructions
```

## Networks

### Ethereum Mainnet

- **Chain ID**: 1
- **Explorer**: https://etherscan.io

### Base Mainnet

- **Chain ID**: 8453
- **Explorer**: https://basescan.org
- **Bridge**: https://bridge.base.org

### Testnets

- **Goerli**: Chain ID 5
- **Base Goerli**: Chain ID 84531

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

## Security

- All contracts use OpenZeppelin implementations
- Comprehensive test coverage (47 tests)
- No hardcoded private keys or secrets
- Secure deployment scripts with masked input

## License

MIT
