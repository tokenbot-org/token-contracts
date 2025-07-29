require("@nomicfoundation/hardhat-toolbox");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Base Goerli Testnet
    baseTestnet: {
      url: "https://goerli.base.org",
      chainId: 84531,
      gasPrice: 1000000000, // 1 gwei
      // Private key will be provided at runtime via deploy script
      accounts: [] // Empty - handled by deploy script
    },
    // Base Mainnet
    baseMainnet: {
      url: "https://mainnet.base.org", 
      chainId: 8453,
      // Gas price auto-detection recommended for mainnet
      // Private key will be provided at runtime via deploy script
      accounts: [] // Empty - handled by deploy script
    },
    // Local Hardhat Network (for testing)
    hardhat: {
      chainId: 31337
    }
  },
  // Etherscan verification (works with Basescan)
  etherscan: {
    apiKey: {
      // Add your Basescan API key here for contract verification
      // Get one at https://basescan.org/myapikey
      baseTestnet: "YOUR_BASESCAN_API_KEY",
      baseMainnet: "YOUR_BASESCAN_API_KEY"
    },
    customChains: [
      {
        network: "baseTestnet",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};