require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

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
    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.ETHEREUM_SEPOLIA_RPC || "https://eth-sepolia.g.alchemy.com/v2/demo",
      chainId: 11155111,
      gasPrice: process.env.GAS_PRICE_GWEI ? parseInt(process.env.GAS_PRICE_GWEI) * 1000000000 : 20000000000,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [`0x${process.env.DEPLOYER_PRIVATE_KEY.replace(/^0x/, "")}`] : []
    },
    // Ethereum Mainnet
    mainnet: {
      url: process.env.ETHEREUM_MAINNET_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo",
      chainId: 1,
      // Gas price auto-detection recommended for mainnet
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [`0x${process.env.DEPLOYER_PRIVATE_KEY.replace(/^0x/, "")}`] : []
    },
    // Base Sepolia Testnet
    baseTestnet: {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      chainId: 84532,
      gasPrice: process.env.GAS_PRICE_GWEI ? parseInt(process.env.GAS_PRICE_GWEI) * 1000000000 : 1000000000,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [`0x${process.env.DEPLOYER_PRIVATE_KEY.replace(/^0x/, "")}`] : []
    },
    // Base Mainnet
    baseMainnet: {
      url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
      chainId: 8453,
      // Gas price auto-detection recommended for mainnet
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [`0x${process.env.DEPLOYER_PRIVATE_KEY.replace(/^0x/, "")}`] : []
    },
    // Local Hardhat Network (for testing)
    hardhat: {
      chainId: 31337,
      forking: process.env.FORK_ENABLED === "true" ? {
        url: process.env.ETHEREUM_MAINNET_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo",
        blockNumber: process.env.FORK_BLOCK_NUMBER ? parseInt(process.env.FORK_BLOCK_NUMBER) : undefined
      } : undefined
    }
  },
  // Contract verification configuration
  etherscan: {
    apiKey: {
      // Etherscan API keys for verification
      sepolia: process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY",
      mainnet: process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY",
      // Basescan API keys for Base network verification
      baseTestnet: process.env.BASESCAN_API_KEY || "YOUR_BASESCAN_API_KEY", 
      baseMainnet: process.env.BASESCAN_API_KEY || "YOUR_BASESCAN_API_KEY"
    },
    customChains: [
      {
        network: "baseTestnet",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
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
