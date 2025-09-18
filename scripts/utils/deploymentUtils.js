function getNetworkConfig(network) {
  const configs = {
    ethereum: {
      chainId: 1,
      rpc: process.env.ETHEREUM_MAINNET_RPC || "https://eth.llamarpc.com",
      explorer: "https://etherscan.io"
    },
    sepolia: {
      chainId: 11155111,
      rpc: process.env.ETHEREUM_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com",
      explorer: "https://sepolia.etherscan.io"
    },
    baseMainnet: {
      chainId: 8453,
      rpc: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
      explorer: "https://basescan.org"
    },
    baseTestnet: {
      chainId: 84532,
      rpc: process.env.BASE_TESTNET_RPC || "https://sepolia.base.org",
      explorer: "https://sepolia.basescan.org"
    },
    hardhat: {
      chainId: 31337,
      rpc: "http://localhost:8545",
      explorer: null
    },
    localhost: {
      chainId: 31337,
      rpc: "http://localhost:8545",
      explorer: null
    }
  };

  return configs[network] || configs.hardhat;
}

function displayDeploymentInfo(deployments) {
  console.log("\n" + "═".repeat(50));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("═".repeat(50));

  for (const [chain, data] of Object.entries(deployments)) {
    if (data) {
      console.log(`\n${chain.toUpperCase()}:`);
      console.log(`  Address: ${data.address}`);
      console.log(`  Network: ${data.network || data.chainId}`);
      if (data.transactionHash) {
        console.log(`  Tx Hash: ${data.transactionHash}`);
      }
    }
  }

  console.log("\n" + "═".repeat(50));
}

module.exports = {
  getNetworkConfig,
  displayDeploymentInfo
};
