# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-chain TokenBot (TBOT) token contract repository supporting Ethereum L1, Base L2, and Solana. The project implements an ERC-20 token on Ethereum with automatic bridging capabilities - Base L2 token is auto-created via Base Bridge, and Solana SPL token is auto-created via Wormhole Bridge.

## Development Commands

### Installation and Setup

```bash
npm install                    # Install dependencies
npm run setup                  # Interactive environment setup
```

### Testing

```bash
npm test                       # Run all tests
npm run test:l1                # Test TokenBotL1 contract only
npm run test:coverage          # Generate coverage report (100% line coverage)
npm run test:gas               # Generate gas usage report
```

### Code Quality

```bash
npm run lint                   # Lint all files (Solidity + JavaScript)
npm run lint:sol               # Lint Solidity files only
npm run lint:js                # Lint JavaScript files only
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format all files with Prettier
npm run format:check           # Check formatting without changes
```

### Build and Compilation

```bash
npm run compile                # Compile Solidity contracts
npx hardhat clean              # Clean artifacts and cache
npx hardhat size-contracts     # Check contract sizes
```

### Deployment

```bash
npm run deploy:testnet   # Deploy to Sepolia testnet
npm run deploy:mainnet   # Deploy to Ethereum mainnet
```

### Contract Verification

```bash
npm run verify                      # Verify single contract
npm run verify:batch               # Batch verify contracts
npm run verify:l1:testnet          # Verify L1 on Sepolia
npm run verify:batch:mainnet       # Batch verify on mainnet
```

## Architecture

### Contract Structure

- **TokenBotL1.sol**: Ethereum mainnet token (ERC20 + Burnable + Pausable + Ownable)
- Mints 1B TBOT tokens (18 decimals) to deployer
- Base L2 token is automatically created when bridged (no manual deployment needed)

### Multi-Chain Flow

1. **Ethereum L1**: Deploy TokenBotL1 (only manual deployment needed)
2. **Base L2**: Auto-created when first bridged via Base Bridge
3. **Solana**: Auto-created when first bridged via Wormhole

### Key Features

- **Pausable**: Owner can pause transfers in emergencies
- **Burnable**: Token holders can burn their tokens
- **Bridge Compatible**: Works with Base native bridge and Wormhole

## Network Configuration

The project is configured in hardhat.config.js for:

- **Ethereum Mainnet** (Chain ID: 1)
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia** (Chain ID: 84532)

Environment variables needed:

- `DEPLOYER_PRIVATE_KEY`: Deployment wallet private key
- `ETHEREUM_MAINNET_RPC`: Ethereum RPC endpoint
- `BASE_MAINNET_RPC`: Base RPC endpoint
- `ETHERSCAN_API_KEY`: For contract verification
- `BASESCAN_API_KEY`: For Base contract verification

## Testing Strategy

The test suite includes comprehensive tests:

- **TokenBotL1.test.js**: Tests covering L1 functionality
- **DeploymentScripts.test.js**: Deployment script validation
- **MultiChainDeployment.test.js**: Multi-chain deployment testing
- **SolanaBridge.test.js**: Solana bridge functionality

All tests include gas usage reporting.

## Important Files

- `hardhat.config.js`: Network and compiler configuration
- `scripts/deploy.js`: Multi-chain deployment orchestration
- `DEPLOYMENT.md`: Detailed deployment instructions
- `BRIDGE_GUIDE.md`: Cross-chain bridging guide
- Security documentation in `docs/security/`

## Development Notes

- Uses Hardhat framework with OpenZeppelin contracts
- Solidity version: 0.8.20 with optimization enabled (200 runs)
- ESLint + Prettier for code formatting
- Solhint for Solidity linting
- All contracts use audited OpenZeppelin implementations
- No custom security implementations - relies on battle-tested patterns

## Common Tasks

When making changes:

1. Always run tests first: `npm test`
2. Check linting: `npm run lint`
3. Ensure proper formatting: `npm run format`
4. Verify coverage remains at 100%: `npm run test:coverage`

For deployments:

1. Configure environment variables properly
2. Test on testnet first: `npm run deploy:testnet`
3. Verify contracts after deployment
4. Document addresses in deployment files
