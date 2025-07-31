const { run } = require("hardhat");

/**
 * Batch verification script for multiple TokenBot contracts
 * Usage: npx hardhat run scripts/verifyBatch.js --network <network>
 */

// Contract addresses to verify - update these after deployment
const CONTRACTS = {
  mainnet: {
    TokenBotL1: "0x..." // Update with actual deployed address
  },
  sepolia: {
    TokenBotL1: "0x..." // Update with actual deployed address
  },
  baseMainnet: {
    TokenBotL2: "0x..." // Update with actual deployed address (if deployed directly)
  },
  baseTestnet: {
    TokenBotL2: "0x..." // Update with actual deployed address
  }
};

async function verifyContract(contractName, contractAddress, network) {
  console.log(`\n🔍 Verifying ${contractName} on ${network}...`);
  console.log(`📍 Address: ${contractAddress}`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: `contracts/${contractName}.sol:${contractName}`
    });

    console.log(`✅ ${contractName} verified successfully!`);
    return true;

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`✅ ${contractName} is already verified!`);
      return true;
    } else {
      console.error(`❌ ${contractName} verification failed:`, error.message);
      return false;
    }
  }
}

async function main() {
  const network = hre.network.name;
  console.log(`🚀 Starting batch verification on ${network}...`);

  const contractsForNetwork = CONTRACTS[network];
  
  if (!contractsForNetwork) {
    console.error(`❌ No contracts configured for network: ${network}`);
    console.log("Available networks:", Object.keys(CONTRACTS).join(", "));
    process.exit(1);
  }

  const results = {};
  let successCount = 0;
  let totalCount = 0;

  // Verify each contract
  for (const [contractName, contractAddress] of Object.entries(contractsForNetwork)) {
    if (contractAddress === "0x...") {
      console.log(`⏭️  Skipping ${contractName} - address not configured`);
      continue;
    }

    totalCount++;
    const success = await verifyContract(contractName, contractAddress, network);
    results[contractName] = success;
    
    if (success) {
      successCount++;
    }

    // Wait between verifications to avoid rate limiting
    if (totalCount > 1) {
      console.log("⏳ Waiting 5 seconds to avoid rate limiting...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Summary
  console.log("\n📊 Verification Summary");
  console.log("========================");
  console.log(`Network: ${network}`);
  console.log(`Successful: ${successCount}/${totalCount}`);
  
  for (const [contractName, success] of Object.entries(results)) {
    const status = success ? "✅" : "❌";
    console.log(`${status} ${contractName}`);
  }

  // Provide explorer links
  console.log("\n🔗 Block Explorer Links:");
  const explorerUrls = {
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    baseMainnet: "https://basescan.org", 
    baseTestnet: "https://sepolia.basescan.org"
  };
  
  const explorerUrl = explorerUrls[network];
  if (explorerUrl) {
    for (const [contractName, contractAddress] of Object.entries(contractsForNetwork)) {
      if (contractAddress !== "0x..." && results[contractName]) {
        console.log(`${contractName}: ${explorerUrl}/address/${contractAddress}#code`);
      }
    }
  }

  if (successCount === totalCount) {
    console.log("\n🎉 All contracts verified successfully!");
  } else {
    console.log(`\n⚠️  ${totalCount - successCount} contract(s) failed verification`);
    process.exit(1);
  }
}

// Handle errors gracefully
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Batch verification failed:", error);
    process.exit(1);
  });