const hre = require("hardhat");
const { getNetworkConfig, displayDeploymentInfo } = require("./utils/deploymentUtils");
const path = require("path");
const fs = require("fs");

async function main() {
  try {
    console.log("\n🚀 Starting Ethereum Deployment");
    console.log("=".repeat(50));

    const network = hre.network.name;
    const config = getNetworkConfig(network);

    console.log(`\n📍 Network: ${network}`);
    console.log(`   Chain ID: ${config.chainId}`);
    console.log(`   RPC: ${config.rpc}`);

    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);

    console.log(`\n👤 Deployer: ${deployer.address}`);
    console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH`);

    const isL1 = network === "ethereum" || network === "sepolia";
    const contractName = isL1 ? "TokenBotL1" : "TokenBotL2";

    console.log(`\n📜 Deploying ${contractName}...`);

    const TokenContract = await hre.ethers.getContractFactory(contractName);
    const token = await TokenContract.deploy();
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log(`   ✅ ${contractName} deployed to: ${tokenAddress}`);

    const totalSupply = await token.totalSupply();
    console.log(`   Total Supply: ${hre.ethers.formatEther(totalSupply)} TBOT`);
    console.log(`   Owner: ${await token.owner()}`);

    const deploymentData = {
      network,
      chainId: config.chainId,
      contractName,
      address: tokenAddress,
      deployer: deployer.address,
      totalSupply: totalSupply.toString(),
      deployedAt: new Date().toISOString(),
      transactionHash: token.deploymentTransaction()?.hash || "N/A"
    };

    const deploymentDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, `${network}-ethereum.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment data saved to: ${deploymentFile}`);

    if (network !== "hardhat" && network !== "localhost") {
      console.log("\n📝 Preparing for verification...");
      console.log("   Run the following command to verify:");
      console.log(`   npx hardhat verify --network ${network} ${tokenAddress}`);
    }

    displayDeploymentInfo({
      ethereum: deploymentData
    });

    console.log("\n✅ Ethereum deployment completed successfully!");
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
