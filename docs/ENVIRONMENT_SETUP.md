# 🔧 Environment Variables Setup Guide

This guide explains how to configure environment variables for TokenBot deployment and development.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Setup Methods](#setup-methods)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Method 1: Interactive Setup (Recommended)

Run our interactive setup script:

```bash
npm run setup
```

This will guide you through configuring:

- Private keys for deployment
- RPC endpoints
- API keys for verification
- Advanced options

### Method 2: Manual Configuration

1. Copy the example file:

```bash
cp .env.example .env
```

2. Edit `.env` with your values:

```bash
# Essential - Your deployment private key
DEPLOYER_PRIVATE_KEY=your_private_key_here_without_0x

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

### Method 3: Environment Variables Only

Set environment variables in your shell:

```bash
# Linux/macOS
export DEPLOYER_PRIVATE_KEY="your_private_key_without_0x"
export ETHERSCAN_API_KEY="your_etherscan_api_key"

# Windows PowerShell
$env:DEPLOYER_PRIVATE_KEY="your_private_key_without_0x"
$env:ETHERSCAN_API_KEY="your_etherscan_api_key"
```

## 🔑 Configuration Options

### Essential Variables

| Variable               | Description                    | Required | Example                    |
| ---------------------- | ------------------------------ | -------- | -------------------------- |
| `DEPLOYER_PRIVATE_KEY` | Private key for deployment     | Yes\*    | `abc123...` (64 hex chars) |
| `ETHERSCAN_API_KEY`    | Etherscan API for verification | No       | `ABC123...`                |
| `BASESCAN_API_KEY`     | Basescan API for verification  | No       | `XYZ789...`                |

\*Required only if not provided interactively during deployment

### Network Configuration

| Variable               | Description              | Default                  |
| ---------------------- | ------------------------ | ------------------------ |
| `ETHEREUM_MAINNET_RPC` | Ethereum mainnet RPC URL | Alchemy demo             |
| `ETHEREUM_SEPOLIA_RPC` | Ethereum Sepolia RPC URL | Alchemy demo             |
| `BASE_MAINNET_RPC`     | Base mainnet RPC URL     | https://mainnet.base.org |
| `BASE_SEPOLIA_RPC`     | Base Sepolia RPC URL     | https://sepolia.base.org |

### Advanced Options

| Variable            | Description              | Default |
| ------------------- | ------------------------ | ------- |
| `GAS_PRICE_GWEI`    | Gas price in gwei        | Auto    |
| `GAS_LIMIT`         | Gas limit for deployment | Auto    |
| `CONFIRMATIONS`     | Block confirmations      | 2       |
| `FORK_ENABLED`      | Enable mainnet forking   | false   |
| `FORK_BLOCK_NUMBER` | Fork at specific block   | Latest  |

### Notification Options

| Variable              | Description                      | Required |
| --------------------- | -------------------------------- | -------- |
| `SLACK_WEBHOOK_URL`   | Slack deployment notifications   | No       |
| `DISCORD_WEBHOOK_URL` | Discord deployment notifications | No       |
| `NOTIFICATION_EMAIL`  | Email for notifications          | No       |

## 🛠️ Setup Methods

### Interactive Setup Script

The easiest way to configure your environment:

```bash
npm run setup
```

Features:

- 🔐 Secure password input (hidden)
- 📝 Guided configuration
- ✅ Validation of inputs
- 🎨 Color-coded interface
- 💾 Preserves existing settings

### Manual .env File

1. Create `.env` from template:

```bash
cp .env.example .env
```

2. Edit with your preferred editor:

```bash
# Open in VS Code
code .env

# Or nano
nano .env

# Or vim
vim .env
```

3. Add your configuration:

```env
# Deployment
DEPLOYER_PRIVATE_KEY=abc123def456...

# Verification
ETHERSCAN_API_KEY=your_etherscan_key
BASESCAN_API_KEY=your_basescan_key

# Custom RPC (optional)
ETHEREUM_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/your-key
```

### CI/CD Environment

For GitHub Actions or other CI/CD:

1. Add secrets in repository settings:
   - `DEPLOYER_PRIVATE_KEY`
   - `ETHERSCAN_API_KEY`
   - `BASESCAN_API_KEY`

2. Use in workflow:

```yaml
- name: Deploy Contract
  env:
    DEPLOYER_PRIVATE_KEY: ${{ secrets.DEPLOYER_PRIVATE_KEY }}
    ETHERSCAN_API_KEY: ${{ secrets.ETHERSCAN_API_KEY }}
  run: npm run deploy:l1:mainnet
```

## 🔒 Security Best Practices

### Private Key Security

**DO:**

- ✅ Use hardware wallets for mainnet
- ✅ Use different keys for testnet/mainnet
- ✅ Store keys in password managers
- ✅ Use environment variables in CI/CD
- ✅ Rotate keys regularly

**DON'T:**

- ❌ Commit private keys to git
- ❌ Share private keys
- ❌ Use production keys for testing
- ❌ Store keys in plain text files
- ❌ Reuse keys across projects

### File Security

1. **Verify .gitignore**:

```bash
# Check that .env is ignored
cat .gitignore | grep .env
```

2. **Check git status**:

```bash
# Ensure .env is not staged
git status
```

3. **Use encrypted storage**:

```bash
# Encrypt .env file
openssl enc -aes-256-cbc -in .env -out .env.enc

# Decrypt when needed
openssl enc -d -aes-256-cbc -in .env.enc -out .env
```

### Hardware Wallet Support

For maximum security, use hardware wallets:

1. Set up in `.env`:

```env
HARDWARE_WALLET=true
HD_PATH=m/44'/60'/0'/0/0
```

2. Connect your hardware wallet
3. Run deployment scripts as normal

## 🔍 Environment Variable Priority

Variables are loaded in this order (highest priority first):

1. **Command line**: Direct environment variables
2. **Shell environment**: Exported variables
3. **.env file**: Local configuration
4. **Defaults**: Hardcoded fallbacks

Example:

```bash
# This takes priority over .env file
DEPLOYER_PRIVATE_KEY=abc123 npm run deploy:l1:mainnet
```

## 🐛 Troubleshooting

### Common Issues

#### Private Key Not Found

```
Error: No DEPLOYER_PRIVATE_KEY found
```

**Solutions:**

1. Run `npm run setup` to configure
2. Check `.env` file exists and has the key
3. Verify environment variable is set:
   ```bash
   echo $DEPLOYER_PRIVATE_KEY
   ```

#### Invalid Private Key Format

```
Error: Invalid private key format
```

**Solutions:**

1. Remove `0x` prefix if present
2. Ensure exactly 64 hexadecimal characters
3. Check for spaces or special characters

#### RPC Connection Failed

```
Error: Could not connect to network
```

**Solutions:**

1. Check RPC URL is correct
2. Verify API key if using provider
3. Test connection:
   ```bash
   curl https://mainnet.base.org
   ```

#### Verification API Key Missing

```
Warning: No API key for verification
```

**Solutions:**

1. Get API key from [Etherscan](https://etherscan.io/apis)
2. Get API key from [Basescan](https://basescan.org/apis)
3. Add to `.env`:
   ```env
   ETHERSCAN_API_KEY=your_key
   BASESCAN_API_KEY=your_key
   ```

### Debugging Environment

Check loaded environment:

```bash
# Show all TokenBot env vars
env | grep -E "(DEPLOYER|ETHERSCAN|BASESCAN|RPC)"

# Test specific variable
node -e "require('dotenv').config(); console.log(process.env.DEPLOYER_PRIVATE_KEY ? 'Set' : 'Not set')"
```

## 📚 Examples

### Testnet Deployment

```bash
# Setup environment
npm run setup

# Deploy to Sepolia
npm run deploy:l1:testnet

# Deploy to Base Sepolia
npm run deploy:l2:testnet
```

### Mainnet Deployment

```bash
# Use specific RPC and gas settings
ETHEREUM_MAINNET_RPC="https://eth-mainnet.g.alchemy.com/v2/your-key" \
GAS_PRICE_GWEI=30 \
npm run deploy:l1:mainnet
```

### CI/CD Deployment

```yaml
# .github/workflows/deploy.yml
- name: Deploy to Mainnet
  env:
    DEPLOYER_PRIVATE_KEY: ${{ secrets.DEPLOYER_PRIVATE_KEY }}
    ETHERSCAN_API_KEY: ${{ secrets.ETHERSCAN_API_KEY }}
    ETHEREUM_MAINNET_RPC: ${{ secrets.ALCHEMY_URL }}
  run: |
    npm ci
    npm run deploy:l1:mainnet
```

## 🔗 Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Full deployment instructions
- [Verification Guide](./VERIFICATION.md) - Contract verification setup
- [Security Guide](./security/SECURITY.md) - Security best practices

---

**Document Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Next Review**: [Date + 1 month]
