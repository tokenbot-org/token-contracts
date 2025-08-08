# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-chain TokenBot (TBOT) token contract repository supporting Ethereum L1, Base L2, and Solana deployments. The project implements ERC-20 tokens with bridging capabilities between Ethereum mainnet and Base L2 using native bridges, plus SPL token support for Solana via Wormhole.

## Development Commands

### Installation and Setup
```bash
npm install                    # Install dependencies
npm run setup                  # Interactive environment setup
```

### Testing
```bash
npm test                       # Run all tests (47 tests)
npm run test:l1                # Test TokenBotL1 contract only  
npm run test:l2                # Test TokenBotL2 contract only
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
npm run deploy:multichain:testnet   # Deploy to Sepolia + Base Sepolia + Solana Devnet
npm run deploy:multichain:mainnet   # Deploy to Ethereum + Base + Solana mainnet
```

### Contract Verification
```bash
npm run verify                      # Verify single contract
npm run verify:batch               # Batch verify contracts
npm run verify:l1:testnet          # Verify L1 on Sepolia
npm run verify:l2:testnet          # Verify L2 on Base Sepolia  
npm run verify:batch:mainnet       # Batch verify on mainnet
```

## Architecture

### Contract Structure
- **TokenBotL1.sol**: Ethereum mainnet token (ERC20 + Burnable + Pausable + Ownable)
- **TokenBotL2.sol**: Base L2 token (adds ERC20Permit for gasless approvals)
- Both contracts mint 1B TBOT tokens (18 decimals) to deployer

### Multi-Chain Flow
1. **Ethereum L1**: Primary token deployment with TokenBotL1
2. **Base L2**: Automatic creation via Base native bridge (no manual deployment needed)
3. **Solana**: SPL token created via scripts/deployMultiChain.js with Wormhole integration

### Key Features
- **Pausable**: Owner can pause transfers in emergencies
- **Burnable**: Token holders can burn their tokens
- **Bridge Compatible**: Works with Base native bridge and Wormhole
- **Permit Support**: L2 version supports EIP-2612 gasless approvals

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
- `SOLANA_RPC_URL`: Solana RPC (optional)
- `SOLANA_PRIVATE_KEY`: Solana wallet (optional)

## Testing Strategy

The test suite includes 47 comprehensive tests:
- **TokenBotL1.test.js**: 26 tests covering L1 functionality
- **TokenBotL2.test.js**: 21 tests covering L2 functionality plus Permit
- **DeploymentScripts.test.js**: Deployment script validation
- **MultiChainDeployment.test.js**: Multi-chain deployment testing
- **SolanaBridge.test.js**: Solana bridge functionality

All tests achieve 100% line coverage and include gas usage reporting.

## Important Files

- `hardhat.config.js`: Network and compiler configuration
- `scripts/deployMultiChain.js`: Multi-chain deployment orchestration
- `scripts/deployL1.js`: Ethereum L1 deployment
- `scripts/deploy.js`: Base L2 deployment
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
2. Test on testnet first: `npm run deploy:multichain:testnet`
3. Verify contracts after deployment
4. Document addresses in deployment files