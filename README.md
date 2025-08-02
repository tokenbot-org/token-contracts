# TokenBot (TBOT) Token Contracts

[![CI](https://github.com/tokenbot-org/token-contracts/workflows/CI/badge.svg)](https://github.com/tokenbot-org/token-contracts/actions/workflows/ci.yml)
[![Security](https://github.com/tokenbot-org/token-contracts/workflows/Security/badge.svg)](https://github.com/tokenbot-org/token-contracts/actions/workflows/security.yml)
[![Coverage](https://github.com/tokenbot-org/token-contracts/workflows/Coverage/badge.svg)](https://github.com/tokenbot-org/token-contracts/actions/workflows/coverage.yml)

This repository contains the official TokenBot (TBOT) multi-chain token contracts supporting Ethereum L1, Base L2, and Solana with native bridge integration.

## Overview

TokenBot (TBOT) is a multi-chain token designed for seamless cross-chain operation between Ethereum mainnet, Base L2, and Solana. The token leverages native bridges and Wormhole for secure, decentralized transfers across all supported networks.

### Token Details

- **Name**: TokenBot
- **Symbol**: TBOT
- **Total Supply**: 1,000,000,000 TBOT
- **Decimals**: 18
- **L1 Network**: Ethereum Mainnet
- **L2 Network**: Base

## Architecture

```
    Ethereum L1 (Origin)
           │
    ┌──────┴──────┐
    │             │
Base L2      Solana
(Auto)      (Created)

Ethereum L1                    Base L2                    Solana
┌─────────────┐               ┌─────────────┐           ┌─────────────┐
│ TokenBotL1  │               │ L2 TBOT     │           │ Wrapped     │
│   (TBOT)    │◄─────────────►│ (Auto-      │◄─────────►│ TBOT (SPL)  │
│             │  Base Bridge   │  created)   │ Wormhole  │   Token     │
└─────────────┘               └─────────────┘           └─────────────┘
```

## Contracts

### TokenBotL1.sol

- **Purpose**: Primary token contract on Ethereum L1
- **Features**: Burnable, Pausable, Ownable
- **Networks**: Ethereum → Base (automatic) → Solana (Wormhole)

## Multi-Chain Deployment

TBOT launches simultaneously across Ethereum, Base, and Solana:

1. **Ethereum L1**: Origin token deployment
2. **Base L2**: Automatic creation via Base Bridge
3. **Solana**: SPL token created and registered with Wormhole

## Quick Start

### Prerequisites

- Node.js v16+
- ETH for gas fees on target network

### Installation

```bash
npm install
```

### Environment Setup

```bash
# Interactive setup (recommended)
npm run setup

# Or manually copy and edit .env
cp .env.example .env
```

See [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md) for detailed configuration options.

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

#### Multi-Chain Deployment

```bash
# Testnet (Sepolia + Base Sepolia + Solana Devnet)
npm run deploy:multichain:testnet

# Mainnet (Ethereum + Base + Solana)
npm run deploy:multichain:mainnet
```

This will:
1. Deploy TokenBotL1 to Ethereum
2. Calculate Base L2 address (created on first bridge)
3. Create SPL token on Solana
4. Register with Wormhole bridge
5. Save all addresses to `deployments/multichain-addresses.json`

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
- **Verification Guide**: [docs/VERIFICATION.md](./docs/VERIFICATION.md)

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

- **Sepolia**: Chain ID 11155111
- **Base Sepolia**: Chain ID 84532

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

## Security

- **Security Score**: 🟢 High (95/100)
- **OpenZeppelin**: All contracts use audited implementations
- **Test Coverage**: 47 tests with 100% line coverage
- **Static Analysis**: Slither and Mythril verified
- **No Secrets**: No hardcoded keys or private information
- **Audit Ready**: External audit recommended before mainnet

### Security Documentation

- [🛡️ Security Overview](./docs/security/SECURITY.md) - Comprehensive security information
- [🎯 Threat Model](./docs/security/THREAT_MODEL.md) - Risk analysis and mitigations
- [🔒 Security Checklist](./docs/security/SECURITY_CHECKLIST.md) - Deployment security guide
- [🧪 Security Testing](./docs/security/SECURITY_TESTING.md) - Testing guidelines and automation

### Reporting Vulnerabilities

Found a security issue? Please report responsibly:
- **Email**: security@tokenbot.com
- **Response**: < 24 hours
- **Bounty**: Up to $10,000 (planned)

See [SECURITY.md](./.github/SECURITY.md) for full details.

## License

MIT
