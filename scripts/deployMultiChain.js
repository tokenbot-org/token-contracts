const { ethers } = require("hardhat");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { createMint } = require("@solana/spl-token");
require("dotenv").config();

async function main() {
  console.log("🚀 Multi-Chain Token Deployment");
  console.log("================================\n");

  // Step 1: Deploy to Ethereum L1
  console.log("1️⃣ Deploying TokenBot to Ethereum L1...");
  const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
  const tokenL1 = await TokenBotL1.deploy();
  await tokenL1.waitForDeployment();
  
  const l1Address = await tokenL1.getAddress();
  console.log("✅ L1 Token deployed:", l1Address);

  // Step 2: Calculate Base L2 address (deterministic)
  const L2_BRIDGE_ADDRESS = "0x4200000000000000000000000000000000000010";
  const l2Address = calculateL2Address(l1Address, L2_BRIDGE_ADDRESS);
  console.log("📍 Base L2 address will be:", l2Address);

  // Step 3: Create Solana SPL token (optional - requires Solana setup)
  let solanaAddress = null;
  if (process.env.SOLANA_RPC_URL && process.env.SOLANA_PRIVATE_KEY) {
    console.log("\n2️⃣ Creating SPL token on Solana...");
    solanaAddress = await createSolanaToken();
    console.log("✅ Solana SPL token created:", solanaAddress);
  } else {
    console.log("\n⚠️  Skipping Solana deployment (no credentials)");
  }

  // Step 4: Register with Wormhole (optional)
  if (solanaAddress && process.env.REGISTER_WORMHOLE === "true") {
    console.log("\n3️⃣ Registering with Wormhole bridge...");
    // This would require Wormhole SDK integration
    console.log("⚠️  Manual registration required at: https://portalbridge.com");
  }

  // Output summary
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("====================");
  console.log("Ethereum L1:", l1Address);
  console.log("Base L2 (predicted):", l2Address);
  console.log("Solana SPL:", solanaAddress || "Not deployed");
  
  // Save addresses
  const addresses = {
    ethereum: l1Address,
    base: l2Address,
    solana: solanaAddress,
    deployedAt: new Date().toISOString()
  };
  
  const fs = require("fs");
  fs.writeFileSync(
    "./deployments/multichain-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  
  console.log("\n✅ Addresses saved to deployments/multichain-addresses.json");
}

function calculateL2Address(l1Token, l2Bridge) {
  // Base uses CREATE2 for deterministic addresses
  // This is a simplified calculation - actual implementation varies
  const salt = ethers.solidityPackedKeccak256(
    ["address", "address"],
    [l1Token, l2Bridge]
  );
  
  const initCodeHash = ethers.solidityPackedKeccak256(
    ["bytes"],
    [getOptimismMintableERC20Bytecode()]
  );
  
  return ethers.getCreate2Address(
    l2Bridge,
    salt,
    initCodeHash
  );
}

function getOptimismMintableERC20Bytecode() {
  // Placeholder - actual bytecode would be needed
  // This is the standard Optimism mintable token bytecode
  return "0x608060405234801561001057600080fd5b50..."; // truncated
}

async function createSolanaToken() {
  const connection = new Connection(process.env.SOLANA_RPC_URL);
  
  // Parse private key
  const secretKey = Uint8Array.from(
    JSON.parse(process.env.SOLANA_PRIVATE_KEY)
  );
  const payer = Keypair.fromSecretKey(secretKey);
  
  // Create SPL token
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
  
  return mint.toBase58();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });