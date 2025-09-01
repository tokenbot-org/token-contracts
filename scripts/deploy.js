const { ethers } = require("hardhat");
const { Connection, Keypair } = require("@solana/web3.js");
const { createMint } = require("@solana/spl-token");
require("dotenv").config();

async function main() {
  // Check if specific chain deployment is requested via environment variable
  const deployChain = process.env.DEPLOY_CHAIN || "all";

  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║     🚀 MULTI-CHAIN TOKEN DEPLOYMENT 🚀     ║");
  console.log("╚════════════════════════════════════════════╝\n");

  if (deployChain !== "all") {
    console.log(`📌 Deployment Mode: ${deployChain.toUpperCase()} ONLY`);
    console.log("\n");
  }

  // Initialize deployment configuration
  console.log("📋 Initializing deployment configuration...");
  const network = hre.network.name;
  const isTestnet = network === "sepolia" || network === "base-sepolia";
  const chainId = await ethers.provider.getNetwork().then(n => n.chainId);

  console.log("┌─ Configuration Details ─────────────────────┐");
  console.log(`│ 📡 Network Mode: ${isTestnet ? "TESTNET" : "MAINNET"}`);
  console.log(`│ 🔗 Network Name: ${network}`);
  console.log(`│ 🆔 Chain ID: ${chainId}`);
  console.log(`│ 📅 Timestamp: ${new Date().toISOString()}`);
  console.log("└─────────────────────────────────────────────┘\n");

  // Validate environment variables
  console.log("🔍 Validating environment configuration...");
  const requiredVars = ["DEPLOYER_PRIVATE_KEY"];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
    throw new Error("Environment validation failed");
  }

  console.log("✅ Environment validation passed");

  // Check deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("\n💰 Deployer Account Information:");
  console.log(`   Address: ${deployer.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("❌ Deployer account has no ETH balance");
    throw new Error("Insufficient funds for deployment");
  }

  console.log("\n════════════════════════════════════════════════");

  // Step 1: Deploy to Ethereum L1
  let l1Address = null;
  let tokenL1 = null;

  if (deployChain === "all" || deployChain === "ethereum") {
    const targetL1 = isTestnet ? "Sepolia" : "Ethereum Mainnet";
    console.log("\n╔═══ ETHEREUM L1 DEPLOYMENT ═══╗");
    console.log(`║ Target: ${targetL1.padEnd(21)}║`);
    console.log("╚══════════════════════════════╝\n");

    console.log("📦 Compiling TokenBotL1 contract...");
    const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
    console.log("✅ Contract compiled successfully");

    console.log("\n🚀 Deploying TokenBotL1...");
    console.log("⏳ Transaction submitted, waiting for confirmation...");

    const deploymentStart = Date.now();
    tokenL1 = await TokenBotL1.deploy();
    const deployTx = tokenL1.deploymentTransaction();

    console.log(`📝 Deployment transaction hash: ${deployTx.hash}`);
    console.log("⏳ Waiting for block confirmations...");

    await tokenL1.waitForDeployment();
    const deploymentTime = ((Date.now() - deploymentStart) / 1000).toFixed(2);

    l1Address = await tokenL1.getAddress();
    const receipt = await deployTx.wait();

    console.log("\n✅ L1 Token deployed successfully!");
    console.log("┌─ Deployment Details ────────────────────────┐");
    console.log(`│ 📍 Contract Address: ${l1Address}`);
    console.log(`│ 🔢 Block Number: ${receipt.blockNumber}`);
    console.log(`│ ⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`│ ⏱️  Deployment Time: ${deploymentTime}s`);
    console.log("└─────────────────────────────────────────────┘");

    // Verify token properties
    console.log("\n🔍 Verifying token properties...");
    const name = await tokenL1.name();
    const symbol = await tokenL1.symbol();
    const decimals = await tokenL1.decimals();
    const totalSupply = await tokenL1.totalSupply();

    console.log("📊 Token Information:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  } else if (deployChain === "solana") {
    console.log("⏭️  Skipping Ethereum deployment (DEPLOY_CHAIN=solana)");
  }

  // Step 2: Base L2 address (will be created automatically when bridged)
  if (deployChain === "all" || deployChain === "ethereum") {
    const targetL2 = isTestnet ? "Base Sepolia" : "Base Mainnet";
    console.log("\n╔═══ BASE L2 INFORMATION ═══╗");
    console.log(`║ Target: ${targetL2.padEnd(18)}║`);
    console.log("╚═══════════════════════════╝\n");

    console.log("ℹ️  Base L2 Deployment Process:");
    console.log("   • Token will be created automatically when bridged");
    console.log("   • Use the Base Bridge UI or SDK to initiate bridging");
    console.log("   • Bridge URL: https://bridge.base.org");
    console.log("   • Expected time: ~20 minutes for testnet, ~7 days for mainnet");

    const baseChainId = isTestnet ? 84532 : 8453;
    console.log("\n📍 Base Network Details:");
    console.log(`   Chain ID: ${baseChainId}`);
    console.log(`   RPC URL: ${isTestnet ? "https://sepolia.base.org" : "https://mainnet.base.org"}`);
  }

  // Step 3: Create Solana SPL token (optional - requires Solana setup)
  let solanaAddress = null;

  if (deployChain === "all" || deployChain === "solana") {
    console.log("\n╔═══ SOLANA DEPLOYMENT ═══╗");

    if (process.env.SOLANA_RPC_URL && process.env.SOLANA_PRIVATE_KEY) {
      const solanaNetwork = isTestnet ? "Solana Devnet" : "Solana Mainnet";
      console.log(`║ Target: ${solanaNetwork.padEnd(16)}║`);
      console.log("╚═════════════════════════╝\n");

      console.log("🔍 Checking Solana configuration...");
      console.log(`   RPC URL: ${process.env.SOLANA_RPC_URL}`);
      console.log(
        `   Private Key: ${process.env.SOLANA_PRIVATE_KEY.substring(0, 6)}...${process.env.SOLANA_PRIVATE_KEY.slice(-4)}`
      );

      try {
        console.log("\n🚀 Creating SPL token on Solana...");
        const solanaStart = Date.now();
        solanaAddress = await createSolanaToken();
        const solanaTime = ((Date.now() - solanaStart) / 1000).toFixed(2);

        console.log("\n✅ Solana SPL token created successfully!");
        console.log("┌─ SPL Token Details ─────────────────────────┐");
        console.log(`│ 📍 Token Address: ${solanaAddress}`);
        console.log(`│ 🌐 Network: ${solanaNetwork}`);
        console.log(`│ ⏱️  Creation Time: ${solanaTime}s`);
        console.log("└─────────────────────────────────────────────┘");
      } catch (error) {
        console.error("\n❌ Solana deployment failed:");
        console.error(`   Error: ${error.message}`);
        console.log("\n⚠️  Continuing with Ethereum/Base deployment only");
      }
    } else {
      console.log("║ Status: Not Configured  ║");
      console.log("╚═════════════════════════╝\n");
      console.log("⚠️  Skipping Solana deployment");
      console.log("   Reason: Missing SOLANA_RPC_URL or SOLANA_PRIVATE_KEY");
      console.log("   To enable: Add credentials to .env file");
    }
  } else if (deployChain === "ethereum") {
    console.log("\n⏭️  Skipping Solana deployment (DEPLOY_CHAIN=ethereum)");
  }

  // Step 4: Register with Wormhole (optional)
  if (solanaAddress && process.env.REGISTER_WORMHOLE === "true") {
    console.log("\n╔═══ WORMHOLE BRIDGE REGISTRATION ═══╗");
    console.log("║ Status: Manual Setup Required      ║");
    console.log("╚════════════════════════════════════╝\n");

    console.log("🌉 Wormhole Bridge Configuration:");
    console.log("   • Ethereum Token: " + l1Address);
    console.log("   • Solana Token: " + solanaAddress);
    console.log("\n📝 Next Steps:");
    console.log("   1. Visit: https://portalbridge.com");
    console.log("   2. Connect wallets for both chains");
    console.log("   3. Register tokens for cross-chain bridging");
    console.log("   4. Attest tokens on target chains");
  } else if (solanaAddress) {
    console.log("\nℹ️  Wormhole bridge not configured (set REGISTER_WORMHOLE=true to enable)");
  }

  // Output summary
  console.log("\n\n╔════════════════════════════════════════════╗");
  console.log("║          📋 DEPLOYMENT SUMMARY 📋          ║");
  console.log("╚════════════════════════════════════════════╝\n");

  console.log("┌─ Multi-Chain Deployment Results ────────────┐");
  console.log(`│ 🌍 Environment: ${isTestnet ? "TESTNET" : "MAINNET"}`);
  console.log(`│ ⏰ Completed: ${new Date().toLocaleString()}`);
  console.log("├─────────────────────────────────────────────┤");
  console.log("│ 📍 Contract Addresses:                      │");
  console.log("│                                             │");
  const targetL1 = isTestnet ? "Sepolia" : "Ethereum Mainnet";
  const targetL2 = isTestnet ? "Base Sepolia" : "Base Mainnet";
  const baseChainId = isTestnet ? 84532 : 8453;

  if (l1Address) {
    console.log(`│ ${targetL1.padEnd(20)}:                │`);
    console.log(`│   ${l1Address}`);
  } else {
    console.log("│ Ethereum: Not deployed                      │");
  }

  console.log("│                                             │");

  if (deployChain === "all" || deployChain === "ethereum") {
    console.log(`│ ${targetL2.padEnd(20)}:                     │`);
    console.log("│   Will be created when bridged              │");
    console.log("│   (Use https://bridge.base.org)             │");
  } else {
    console.log("│ Base: N/A                                   │");
  }

  if (solanaAddress) {
    const solanaNetwork = isTestnet ? "Solana Devnet" : "Solana Mainnet";
    console.log("│                                             │");
    console.log(`│ ${solanaNetwork.padEnd(20)}:                 │`);
    console.log(`│   ${solanaAddress}`);
  } else {
    console.log("│                                             │");
    console.log("│ Solana: Not deployed                        │");
  }

  console.log("└─────────────────────────────────────────────┘");

  // Save addresses
  console.log("\n💾 Saving deployment information...");

  const addresses = {
    network,
    chainId,
    mode: isTestnet ? "testnet" : "mainnet",
    contracts: {
      ethereum: l1Address
        ? {
            address: l1Address,
            network: isTestnet ? "Sepolia" : "Ethereum Mainnet",
            chainId: chainId.toString(),
            deploymentTx: tokenL1.deploymentTransaction().hash
          }
        : null,
      base:
        deployChain === "all" || deployChain === "ethereum"
          ? {
              address: "Will be created when bridged",
              network: targetL2,
              chainId: baseChainId.toString(),
              bridgeUrl: "https://bridge.base.org"
            }
          : null,
      solana: solanaAddress
        ? {
            address: solanaAddress,
            network: isTestnet ? "Solana Devnet" : "Solana Mainnet",
            rpcUrl: process.env.SOLANA_RPC_URL
          }
        : null
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  const fs = require("fs");
  const deploymentPath = "./deployments";

  // Ensure deployments directory exists
  if (!fs.existsSync(deploymentPath)) {
    console.log("📁 Creating deployments directory...");
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const fileName = `multichain-addresses-${isTestnet ? "testnet" : "mainnet"}.json`;
  const filePath = `${deploymentPath}/${fileName}`;

  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

  console.log(`✅ Deployment data saved to: ${filePath}`);

  // Also save a copy with generic name for easy access
  fs.writeFileSync(`${deploymentPath}/multichain-addresses.json`, JSON.stringify(addresses, null, 2));

  console.log("\n🎉 Multi-chain deployment completed successfully!");
  console.log("\n📚 Next Steps:");
  console.log("   1. Verify contracts on Etherscan: npm run verify");
  console.log("   2. Bridge tokens to Base L2");
  if (solanaAddress) {
    console.log("   3. Configure Wormhole bridge for cross-chain transfers");
  }
  console.log("\n════════════════════════════════════════════════\n");
}

async function createSolanaToken() {
  console.log("\n🔗 Connecting to Solana network...");
  const connection = new Connection(process.env.SOLANA_RPC_URL);
  const bs58 = require("bs58");

  // Test connection
  try {
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana (version: ${version["solana-core"]})`);
  } catch (error) {
    console.error("❌ Failed to connect to Solana RPC");
    throw error;
  }

  // Parse private key - handle both array format and base58 string
  console.log("\n🔑 Parsing Solana private key...");
  let secretKey;
  const privateKeyEnv = process.env.SOLANA_PRIVATE_KEY;

  console.log("   Key format detection...");

  try {
    // First try to parse as JSON array
    if (privateKeyEnv.startsWith("[")) {
      console.log("   Format: JSON array");
      secretKey = Uint8Array.from(JSON.parse(privateKeyEnv));
    } else if (privateKeyEnv.includes(",")) {
      // Comma-separated values
      console.log("   Format: Comma-separated values");
      secretKey = Uint8Array.from(privateKeyEnv.split(",").map(s => parseInt(s.trim())));
    } else {
      // Try as base58 encoded string (most common format)
      try {
        console.log("   Format: Base58 string (Phantom/CLI format)");
        secretKey = bs58.decode(privateKeyEnv.trim());
      } catch (bs58Error) {
        // If not base58, try parsing as space-separated numbers
        console.log("   Format: Space-separated numbers");
        const numbers = privateKeyEnv
          .trim()
          .split(/\s+/)
          .map(s => parseInt(s));
        if (numbers.some(isNaN)) {
          throw new Error("Invalid private key format");
        }
        secretKey = Uint8Array.from(numbers);
      }
    }

    // Validate the secret key length
    if (secretKey.length !== 64) {
      throw new Error(`Invalid secret key size: expected 64 bytes, got ${secretKey.length} bytes`);
    }
    console.log(`✅ Private key parsed successfully (${secretKey.length} bytes)`);
  } catch (error) {
    console.error("\n❌ Error parsing Solana private key:", error.message);
    console.log("\n📝 Supported private key formats:");
    console.log("   1. Base58 string (Phantom wallet / solana-keygen)");
    console.log("   2. JSON array: [1,2,3,...] (64 bytes)");
    console.log("   3. Comma-separated: 1,2,3,... (64 bytes)");
    console.log("   4. Space-separated: 1 2 3 ... (64 bytes)");
    console.log("\n💡 Tips:");
    console.log("   • From Phantom: Settings → Security → Export Private Key");
    console.log("   • Generate new: solana-keygen new --no-outfile");
    console.log("   • Verify format: Key should be 64 bytes when decoded");
    throw error;
  }

  const payer = Keypair.fromSecretKey(secretKey);
  console.log(`\n👤 Payer wallet address: ${payer.publicKey.toBase58()}`);

  // Check wallet balance
  console.log("💰 Checking wallet balance...");
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`   Balance: ${balance / 1e9} SOL`);

  if (balance === 0) {
    console.warn("⚠️  Warning: Wallet has no SOL balance");
    console.log("   You may need to airdrop SOL for devnet:");
    console.log("   solana airdrop 1 " + payer.publicKey.toBase58());
  }

  // Create SPL token
  console.log("\n🏭 Creating SPL token mint...");
  console.log("   Mint Authority: " + payer.publicKey.toBase58());
  console.log("   Freeze Authority: " + payer.publicKey.toBase58());
  console.log("   Decimals: 9 (Solana standard)");
  console.log("   Program: SPL Token");

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority
    9, // decimals (Solana standard)
    undefined,
    undefined,
    "spl-token" // token program
  );

  const mintAddress = mint.toBase58();
  console.log(`\n🎊 SPL Token mint created: ${mintAddress}`);

  // Explorer link
  const explorerUrl = process.env.SOLANA_RPC_URL.includes("devnet")
    ? `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`
    : `https://explorer.solana.com/address/${mintAddress}`;
  console.log(`🔍 View on Explorer: ${explorerUrl}`);

  return mintAddress;
}

main()
  .then(() => {
    console.log("✨ Deployment script completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n💥 DEPLOYMENT FAILED");
    console.error("═══════════════════");
    console.error("Error Type:", error.name || "Unknown");
    console.error("Error Message:", error.message);

    if (error.stack) {
      console.error("\nStack Trace:");
      console.error(error.stack);
    }

    console.error("\n📝 Troubleshooting Tips:");
    console.error("   1. Check your network connection");
    console.error("   2. Verify environment variables in .env");
    console.error("   3. Ensure sufficient balance for gas fees");
    console.error("   4. Confirm RPC endpoints are correct");
    console.error("   5. Check if contracts compile: npx hardhat compile");

    process.exit(1);
  });
