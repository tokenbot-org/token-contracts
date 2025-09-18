const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {

  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║       🚀 TOKEN DEPLOYMENT 🚀              ║");
  console.log("╚════════════════════════════════════════════╝\n");

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

  // Deploy to Ethereum L1
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
  const tokenL1 = await TokenBotL1.deploy();
  const deployTx = tokenL1.deploymentTransaction();

  console.log(`📝 Deployment transaction hash: ${deployTx.hash}`);
  console.log("⏳ Waiting for block confirmations...");

  await tokenL1.waitForDeployment();
  const deploymentTime = ((Date.now() - deploymentStart) / 1000).toFixed(2);

  const l1Address = await tokenL1.getAddress();
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

  // Base L2 information
  const targetL2 = isTestnet ? "Base Sepolia" : "Base Mainnet";
  console.log("\n╔═══ BASE L2 INFORMATION ═══╗");
  console.log(`║ Target: ${targetL2.padEnd(18)}║`);
  console.log("╚═══════════════════════════╝\n");

  console.log("ℹ️  Base L2 Token Process:");
  console.log("   • Token will be created automatically when bridged");
  console.log("   • Use https://bridge.base.org to bridge");
  console.log("   • No manual deployment needed");

  const baseChainId = isTestnet ? 84532 : 8453;
  console.log("\n📍 Base Network Details:");
  console.log(`   Chain ID: ${baseChainId}`);
  console.log(`   RPC URL: ${isTestnet ? "https://sepolia.base.org" : "https://mainnet.base.org"}`);

  // Solana information
  console.log("\n╔═══ SOLANA INFORMATION ═══╗");
  console.log("║ Via Wormhole Bridge      ║");
  console.log("╚═══════════════════════════╝\n");

  console.log("ℹ️  Solana Token Process:");
  console.log("   • Token will be created when first bridged via Wormhole");
  console.log("   • Use https://portalbridge.com to bridge");
  console.log("   • Register Ethereum token on Portal first");
  console.log("   • No manual SPL token creation needed");

  // Output summary
  console.log("\n\n╔════════════════════════════════════════════╗");
  console.log("║          📋 DEPLOYMENT SUMMARY 📋          ║");
  console.log("╚════════════════════════════════════════════╝\n");

  console.log("┌─ Deployment Results ────────────────────────┐");
  console.log(`│ 🌍 Environment: ${isTestnet ? "TESTNET" : "MAINNET"}`);
  console.log(`│ ⏰ Completed: ${new Date().toLocaleString()}`);
  console.log("├─────────────────────────────────────────────┤");
  console.log("│ 📍 Contract Addresses:                      │");
  console.log("│                                             │");
  console.log(`│ ${targetL1.padEnd(20)}:                │`);
  console.log(`│   ${l1Address}`);
  console.log("│                                             │");
  console.log(`│ ${targetL2.padEnd(20)}:                     │`);
  console.log("│   Will be created when bridged              │");
  console.log("│   (Use https://bridge.base.org)             │");
  console.log("│                                             │");
  console.log("│ Solana:                                     │");
  console.log("│   Will be created when bridged via Wormhole │");
  console.log("│   (Use https://portalbridge.com)            │");
  console.log("└─────────────────────────────────────────────┘");

  // Save addresses
  console.log("\n💾 Saving deployment information...");

  const addresses = {
    network,
    chainId,
    mode: isTestnet ? "testnet" : "mainnet",
    contracts: {
      ethereum: {
        address: l1Address,
        network: isTestnet ? "Sepolia" : "Ethereum Mainnet",
        chainId: chainId.toString(),
        deploymentTx: tokenL1.deploymentTransaction().hash
      },
      base: {
        address: "Will be created when bridged",
        network: targetL2,
        chainId: baseChainId.toString(),
        bridgeUrl: "https://bridge.base.org"
      },
      solana: {
        address: "Will be created when bridged via Wormhole",
        network: isTestnet ? "Solana Devnet" : "Solana Mainnet",
        bridgeUrl: "https://portalbridge.com"
      }
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

  // Helper function to handle BigInt serialization
  const jsonStringify = (obj) => {
    return JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    , 2);
  };

  fs.writeFileSync(filePath, jsonStringify(addresses));

  console.log(`✅ Deployment data saved to: ${filePath}`);

  // Also save a copy with generic name for easy access
  fs.writeFileSync(`${deploymentPath}/multichain-addresses.json`, jsonStringify(addresses));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📚 Next Steps:");
  console.log("   1. Verify contract on Etherscan: npm run verify");
  console.log("   2. Bridge tokens to Base via https://bridge.base.org");
  console.log("   3. Bridge tokens to Solana via https://portalbridge.com");
  console.log("\n════════════════════════════════════════════════\n");
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
