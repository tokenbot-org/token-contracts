const { run } = require("hardhat");

/**
 * Verification script for TokenBot contracts
 * Usage: npx hardhat run scripts/verify.js --network <network>
 */

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const contractAddress = args[0];
  const contractName = args[1] || "TokenBotL2"; // Default to L2 contract
  
  if (!contractAddress) {
    console.error("❌ Error: Contract address is required");
    console.log("Usage: npx hardhat run scripts/verify.js --network <network> <contract_address> [contract_name]");
    console.log("Example: npx hardhat run scripts/verify.js --network mainnet 0x123... TokenBotL1");
    process.exit(1);
  }

  console.log(`🔍 Verifying ${contractName} contract at address: ${contractAddress}`);
  console.log(`📡 Network: ${hre.network.name}`);

  try {
    // Verify the contract
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // Both contracts have no constructor arguments
      contract: `contracts/${contractName}.sol:${contractName}`
    });

    console.log(`✅ Contract verified successfully!`);
    console.log(`🔗 View on block explorer:`);
    
    // Provide explorer links based on network
    const explorerUrls = {
      mainnet: "https://etherscan.io",
      sepolia: "https://sepolia.etherscan.io", 
      baseMainnet: "https://basescan.org",
      baseTestnet: "https://sepolia.basescan.org"
    };
    
    const explorerUrl = explorerUrls[hre.network.name];
    if (explorerUrl) {
      console.log(`   ${explorerUrl}/address/${contractAddress}#code`);
    }

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      
      // Provide helpful debugging information
      console.log("\n🔧 Debugging tips:");
      console.log("1. Make sure the contract address is correct");
      console.log("2. Ensure you're using the right network");
      console.log("3. Check that your API keys are set in environment variables:");
      console.log("   - ETHERSCAN_API_KEY for Ethereum networks");
      console.log("   - BASESCAN_API_KEY for Base networks");
      console.log("4. Wait a few minutes after deployment before verifying");
      
      process.exit(1);
    }
  }
}

// Handle errors gracefully
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });