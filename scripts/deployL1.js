const hre = require("hardhat");
const readline = require("readline");
const { Writable } = require("stream");

// Muted output stream for password input
const mutableStdout = new Writable({
  write: function (chunk, encoding, callback) {
    if (!this.muted) process.stdout.write(chunk, encoding);
    callback();
  }
});

mutableStdout.muted = false;

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

async function askForPrivateKey() {
  mutableStdout.muted = false;
  console.log("\n🔐 Private Key Required for Deployment");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  mutableStdout.write("Enter your private key: ");
  mutableStdout.muted = true;

  const privateKey = await askQuestion("");

  mutableStdout.muted = false;
  console.log("\n"); // New line after hidden input

  return privateKey.trim();
}

async function main() {
  console.log("🚀 TokenBot L1 Deployment Script");
  console.log("================================\n");

  // Get network from hardhat runtime
  const network = hre.network.name;
  console.log(`📡 Deploying to network: ${network}`);

  // Get private key securely
  const privateKey = await askForPrivateKey();

  // Validate private key format
  const cleanKey = privateKey.replace("0x", "");
  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    console.error("❌ Invalid private key format. Expected 64 hex characters.");
    process.exit(1);
  }

  // Create wallet with private key
  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  console.log(`📬 Deploying from address: ${wallet.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(wallet.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("❌ Insufficient balance. Please fund your account with ETH.");
    process.exit(1);
  }

  console.log("\n📋 Contract Details:");
  console.log("━━━━━━━━━━━━━━━━━━━");
  console.log("Name: TokenBot");
  console.log("Symbol: TBOT");
  console.log("Total Supply: 1,000,000,000 TBOT");
  console.log("Contract: TokenBotL1.sol");

  console.log("\n🔄 Deploying contract...");

  try {
    const TokenBotL1 = await hre.ethers.getContractFactory("TokenBotL1", wallet);
    const tokenBot = await TokenBotL1.deploy();

    console.log("⏳ Waiting for deployment confirmation...");
    await tokenBot.waitForDeployment();

    const contractAddress = await tokenBot.getAddress();
    console.log("\n✅ TokenBot L1 deployed successfully!");
    console.log(`📝 Contract address: ${contractAddress}`);

    // Get transaction receipt for more details
    const deploymentTx = tokenBot.deploymentTransaction();
    const receipt = await deploymentTx.wait();
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`📦 Transaction hash: ${deploymentTx.hash}`);

    // Display post-deployment information
    console.log("\n🎯 Next Steps:");
    console.log("━━━━━━━━━━━━━━━");
    console.log("1. Verify contract on Etherscan:");
    console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);
    console.log("\n2. Bridge tokens to Base L2:");
    console.log("   - Visit https://bridge.base.org");
    console.log("   - Connect wallet and select 'Deposit'");
    console.log("   - Add TBOT token address:", contractAddress);
    console.log("   - Enter amount to bridge");
    console.log("\n3. The Base bridge will automatically:");
    console.log("   - Create the L2 representation of TBOT");
    console.log("   - Handle all cross-chain messaging");
    console.log("   - Mint equivalent tokens on Base L2");

    console.log("\n📊 Token Information:");
    console.log("━━━━━━━━━━━━━━━━━━━");
    console.log("L1 Token Address:", contractAddress);
    console.log("L2 Token Address: Will be created by Base Bridge");
    console.log("Bridge UI: https://bridge.base.org");

    if (network === "goerli") {
      console.log("\n🧪 Testnet Resources:");
      console.log("━━━━━━━━━━━━━━━━━━━");
      console.log("Goerli Faucet: https://goerlifaucet.com");
      console.log("Base Goerli Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
    }
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
