const hre = require("hardhat");
const readline = require("readline");
const { Wallet } = require("ethers");

/**
 * Prompts user for private key input securely
 * @returns {Promise<string>} The private key entered by the user
 */
function promptPrivateKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  return new Promise((resolve) => {
    // Hide input while typing
    rl.question("Enter your private key (input hidden): ", (privateKey) => {
      rl.close();
      console.log(""); // New line after input
      resolve(privateKey.trim());
    });

    // Mask the input
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write("*");
      } else {
        rl.output.write(stringToWrite);
      }
    };
    rl.stdoutMuted = true;
  });
}

/**
 * Main deployment function
 */
async function main() {
  console.log("🚀 TokenBot Deployment Script");
  console.log("============================");
  
  // Get network information
  const network = hre.network.name;
  console.log(`\n📡 Deploying to network: ${network}`);
  
  // Validate network
  if (!["baseTestnet", "baseMainnet"].includes(network)) {
    throw new Error(
      `Invalid network: ${network}. Use --network baseTestnet or --network baseMainnet`
    );
  }
  
  // Network details for confirmation
  const networkDetails = {
    baseTestnet: {
      name: "Base Goerli Testnet",
      chainId: 84531,
      explorer: "https://goerli.basescan.org"
    },
    baseMainnet: {
      name: "Base Mainnet",
      chainId: 8453,
      explorer: "https://basescan.org"
    }
  };
  
  const currentNetwork = networkDetails[network];
  console.log(`   Network: ${currentNetwork.name}`);
  console.log(`   Chain ID: ${currentNetwork.chainId}`);
  console.log(`   Explorer: ${currentNetwork.explorer}`);
  
  // Prompt for private key
  console.log("\n🔐 Private Key Required");
  console.log("   Please enter your private key to deploy the contract.");
  console.log("   Make sure you have enough ETH for gas fees on Base.\n");
  
  const privateKey = await promptPrivateKey();
  
  // Validate private key format
  if (!privateKey.match(/^(0x)?[0-9a-fA-F]{64}$/)) {
    throw new Error("Invalid private key format. Expected 64 hex characters (with or without 0x prefix)");
  }
  
  // Create wallet from private key
  const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const wallet = new Wallet(formattedKey, hre.ethers.provider);
  
  console.log(`\n💼 Deploying from address: ${wallet.address}`);
  
  // Get deployer balance
  const balance = await wallet.provider.getBalance(wallet.address);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    throw new Error("Insufficient balance. Please fund your wallet with ETH on Base.");
  }
  
  // Get contract factory
  console.log("\n📄 Compiling and preparing TokenBot contract...");
  const TokenBot = await hre.ethers.getContractFactory("TokenBot", wallet);
  
  // Deploy contract
  console.log("\n🔨 Deploying TokenBot...");
  console.log("   This may take a few moments...\n");
  
  const tokenBot = await TokenBot.deploy();
  await tokenBot.waitForDeployment();
  
  const contractAddress = await tokenBot.getAddress();
  
  // Get contract details
  const name = await tokenBot.name();
  const symbol = await tokenBot.symbol();
  const decimals = await tokenBot.decimals();
  const totalSupply = await tokenBot.totalSupply();
  const owner = await tokenBot.owner();
  
  // Display deployment summary
  console.log("✅ Deployment Successful!");
  console.log("========================");
  console.log(`\n📋 Contract Details:`);
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Token Name: ${name}`);
  console.log(`   Token Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  console.log(`   Owner: ${owner}`);
  console.log(`\n🔗 View on Explorer:`);
  console.log(`   ${currentNetwork.explorer}/address/${contractAddress}`);
  
  // Verify reminder
  if (network === "baseMainnet") {
    console.log(`\n📝 Don't forget to verify your contract:`);
    console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);
  }
  
  console.log("\n🎉 Deployment complete!");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });