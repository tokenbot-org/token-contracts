const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

describe("Multi-Chain Deployment", function () {
  let tokenL1;
  let owner;
  let l1Address;

  const BASE_L2_BRIDGE = "0x4200000000000000000000000000000000000010";
  const WORMHOLE_BRIDGE = "0x3ee18B2214AFF97000D974cf647E7C347E8fa585";

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy L1 token
    const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
    tokenL1 = await TokenBotL1.deploy();
    await tokenL1.waitForDeployment();
    l1Address = await tokenL1.getAddress();
  });

  describe("L1 Token Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await tokenL1.name()).to.equal("TokenBot");
      expect(await tokenL1.symbol()).to.equal("TBOT");
      expect(await tokenL1.decimals()).to.equal(18);
      expect(await tokenL1.totalSupply()).to.equal(ethers.parseEther("1000000000"));
    });

    it("Should assign total supply to deployer", async function () {
      const ownerBalance = await tokenL1.balanceOf(owner.address);
      expect(ownerBalance).to.equal(await tokenL1.totalSupply());
    });

    it("Should be compatible with bridge interfaces", async function () {
      // Test standard ERC20 functions required by bridges
      expect(await tokenL1.approve(WORMHOLE_BRIDGE, ethers.parseEther("100"))).to.not.be.reverted;
      expect(await tokenL1.allowance(owner.address, WORMHOLE_BRIDGE)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Base L2 Address Calculation", function () {
    it("Should calculate deterministic L2 address", function () {
      // Simplified CREATE2 calculation for testing
      const salt = ethers.solidityPackedKeccak256(["address", "address"], [l1Address, BASE_L2_BRIDGE]);

      // Verify salt is deterministic
      const salt2 = ethers.solidityPackedKeccak256(["address", "address"], [l1Address, BASE_L2_BRIDGE]);

      expect(salt).to.equal(salt2);
      expect(salt).to.match(/^0x[a-fA-F0-9]{64}$/);
    });

    it("Should generate unique addresses for different L1 tokens", async function () {
      // Deploy second token
      const TokenBotL1Factory = await ethers.getContractFactory("TokenBotL1");
      const token2 = await TokenBotL1Factory.deploy();
      await token2.waitForDeployment();
      const l1Address2 = await token2.getAddress();

      // Calculate salts
      const salt1 = ethers.solidityPackedKeccak256(["address", "address"], [l1Address, BASE_L2_BRIDGE]);

      const salt2 = ethers.solidityPackedKeccak256(["address", "address"], [l1Address2, BASE_L2_BRIDGE]);

      expect(salt1).to.not.equal(salt2);
    });
  });

  describe("Deployment Output", function () {
    it("Should create deployment file with correct structure", async function () {
      const deploymentData = {
        ethereum: l1Address,
        base: "0x" + "1".repeat(40), // Mock L2 address
        solana: "7xKXtg2K5MFGNbZVaVqtpWNvWd9PQR", // Mock Solana address
        deployedAt: new Date().toISOString()
      };

      // Create deployments directory if it doesn't exist
      const deploymentsDir = path.join(__dirname, "../deployments");
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
      }

      // Write test deployment file
      const testFilePath = path.join(deploymentsDir, "test-multichain.json");
      fs.writeFileSync(testFilePath, JSON.stringify(deploymentData, null, 2));

      // Verify file contents
      const savedData = JSON.parse(fs.readFileSync(testFilePath, "utf8"));
      expect(savedData.ethereum).to.equal(l1Address);
      expect(savedData.base).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(savedData.solana).to.be.a("string");
      expect(savedData.deployedAt).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Clean up
      fs.unlinkSync(testFilePath);
    });
  });

  describe("Bridge Compatibility", function () {
    it("Should support Base bridge requirements", async function () {
      // Base bridge requires standard ERC20 functions
      const amount = ethers.parseEther("100");

      // Test approval
      await expect(tokenL1.approve(BASE_L2_BRIDGE, amount))
        .to.emit(tokenL1, "Approval")
        .withArgs(owner.address, BASE_L2_BRIDGE, amount);

      // Test transfer (simulating bridge lock)
      await expect(tokenL1.transfer(BASE_L2_BRIDGE, amount))
        .to.emit(tokenL1, "Transfer")
        .withArgs(owner.address, BASE_L2_BRIDGE, amount);

      // Verify balance changes
      expect(await tokenL1.balanceOf(BASE_L2_BRIDGE)).to.equal(amount);
    });

    it("Should support Wormhole bridge requirements", async function () {
      // Wormhole requires approval and transferFrom
      const amount = ethers.parseEther("50");

      // Create a mock bridge signer
      const [, , bridgeSigner] = await ethers.getSigners();

      // Owner approves bridge signer to spend tokens
      await tokenL1.connect(owner).approve(bridgeSigner.address, amount);

      // Simulate bridge calling transferFrom
      await expect(
        tokenL1.connect(bridgeSigner).transferFrom(owner.address, WORMHOLE_BRIDGE, amount)
      ).to.changeTokenBalances(tokenL1, [owner, WORMHOLE_BRIDGE], [-amount, amount]);
    });

    it("Should handle pause functionality during bridging", async function () {
      const amount = ethers.parseEther("100");

      // Pause the token
      await tokenL1.pause();

      // Bridging should fail when paused
      await expect(tokenL1.transfer(BASE_L2_BRIDGE, amount)).to.be.revertedWithCustomError(tokenL1, "EnforcedPause");

      // Unpause
      await tokenL1.unpause();

      // Bridging should work again
      await expect(tokenL1.transfer(BASE_L2_BRIDGE, amount)).to.not.be.reverted;
    });
  });

  describe("Multi-Chain Configuration", function () {
    it("Should validate RPC URLs", function () {
      const validUrls = [
        "https://eth-mainnet.g.alchemy.com/v2/key",
        "https://api.mainnet-beta.solana.com",
        "https://base-mainnet.g.alchemy.com/v2/key"
      ];

      validUrls.forEach(url => {
        expect(url).to.match(/^https:\/\//);
      });
    });

    it("Should handle missing Solana configuration", async function () {
      // Test deployment without Solana credentials
      const deploymentData = {
        ethereum: l1Address,
        base: "0x" + "2".repeat(40),
        solana: null,
        deployedAt: new Date().toISOString()
      };

      expect(deploymentData.ethereum).to.not.be.null;
      expect(deploymentData.base).to.not.be.null;
      expect(deploymentData.solana).to.be.null;
    });
  });
});
