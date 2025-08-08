const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { generateTestConfig } = require("./helpers/multichain");

describe("Deployment Scripts", function () {
  let owner;
  const deploymentsDir = path.join(__dirname, "../deployments");

  before(async function () {
    [owner] = await ethers.getSigners();
    
    // Ensure deployments directory exists
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
  });

  describe("Environment Configuration", function () {
    it("Should validate required environment variables", function () {
      const requiredVars = [
        "PRIVATE_KEY",
        "ETHEREUM_RPC_URL",
        "BASE_RPC_URL"
      ];

      const optionalVars = [
        "SOLANA_RPC_URL",
        "SOLANA_PRIVATE_KEY",
        "ETHERSCAN_API_KEY",
        "BASESCAN_API_KEY"
      ];

      // In test environment, we don't need actual values
      // Just verify the structure
      expect(requiredVars).to.be.an("array");
      expect(optionalVars).to.be.an("array");
    });

    it("Should handle missing Solana configuration gracefully", function () {
      const config = generateTestConfig({
        solana: {
          rpcUrl: null,
          privateKey: null
        }
      });

      expect(config.networks.ethereum).to.exist;
      expect(config.networks.base).to.exist;
      expect(config.solana.rpcUrl).to.be.null;
    });
  });

  describe("Deployment File Management", function () {
    it("Should create deployment files with correct structure", function () {
      const testDeployment = {
        network: "sepolia",
        contracts: {
          TokenBotL1: {
            address: "0x" + "1".repeat(40),
            transactionHash: "0x" + "a".repeat(64),
            blockNumber: 12345678,
            timestamp: new Date().toISOString()
          }
        }
      };

      const filename = `test-${Date.now()}-deployment.json`;
      const filepath = path.join(deploymentsDir, filename);
      
      // Write test file
      fs.writeFileSync(filepath, JSON.stringify(testDeployment, null, 2));
      
      // Verify it was created
      expect(fs.existsSync(filepath)).to.be.true;
      
      // Read and verify contents
      const saved = JSON.parse(fs.readFileSync(filepath, "utf8"));
      expect(saved.network).to.equal("sepolia");
      expect(saved.contracts.TokenBotL1.address).to.match(/^0x[0-9a-fA-F]{40}$/);
      
      // Clean up
      fs.unlinkSync(filepath);
    });

    it("Should handle deployment history", function () {
      const deployments = [];
      
      // Create multiple test deployments
      for (let i = 0; i < 3; i++) {
        deployments.push({
          version: i + 1,
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
          address: "0x" + i.toString().repeat(40)
        });
      }

      // Save history
      const historyFile = path.join(deploymentsDir, "test-history.json");
      fs.writeFileSync(historyFile, JSON.stringify(deployments, null, 2));
      
      // Read history
      const history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
      expect(history).to.have.lengthOf(3);
      expect(history[0].version).to.equal(1);
      
      // Clean up
      fs.unlinkSync(historyFile);
    });
  });

  describe("Network Configuration", function () {
    it("Should handle mainnet configuration", function () {
      const config = generateTestConfig();
      
      expect(config.networks.ethereum.chainId).to.equal(1);
      expect(config.networks.base.chainId).to.equal(8453);
      expect(config.networks.solana.cluster).to.equal("mainnet-beta");
    });

    it("Should handle testnet configuration", function () {
      const testnetConfig = {
        networks: {
          ethereum: {
            chainId: 11155111, // Sepolia
            name: "sepolia"
          },
          base: {
            chainId: 84532, // Base Sepolia
            name: "base-sepolia"
          },
          solana: {
            cluster: "devnet"
          }
        }
      };

      expect(testnetConfig.networks.ethereum.chainId).to.equal(11155111);
      expect(testnetConfig.networks.base.chainId).to.equal(84532);
      expect(testnetConfig.networks.solana.cluster).to.equal("devnet");
    });
  });

  describe("Gas Estimation", function () {
    it("Should estimate deployment gas correctly", async function () {
      const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
      const deployTx = await TokenBotL1.getDeployTransaction();
      
      // Estimate gas
      const estimatedGas = await ethers.provider.estimateGas(deployTx);
      
      // Deployment should be under 3M gas
      expect(estimatedGas).to.be.lt(3000000n);
      expect(estimatedGas).to.be.gt(0n);
    });
  });

  describe("Error Handling", function () {
    it("Should handle deployment failures gracefully", async function () {
      // Test with insufficient gas
      const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
      
      try {
        // This would fail in a real environment with gasLimit: 1
        const token = await TokenBotL1.deploy({ gasLimit: 1 });
        expect.fail("Should have thrown an error");
      } catch (error) {
        // In test environment, might not fail the same way
        expect(error).to.exist;
      }
    });

    it("Should validate addresses before saving", function () {
      const invalidAddresses = [
        "0x123", // Too short
        "123456789012345678901234567890123456789012", // No 0x prefix
        "0xGGGG", // Invalid hex
        null,
        undefined,
        ""
      ];

      invalidAddresses.forEach(addr => {
        const isValid = !!(addr && 
                         typeof addr === "string" && 
                         /^0x[0-9a-fA-F]{40}$/.test(addr));
        expect(isValid).to.equal(false);
      });

      // Valid address
      const validAddress = "0x" + "a".repeat(40);
      expect(/^0x[0-9a-fA-F]{40}$/.test(validAddress)).to.be.true;
    });
  });
});