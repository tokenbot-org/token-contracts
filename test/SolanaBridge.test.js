const { expect } = require("chai");
const { ethers } = require("hardhat");
const { 
  mockCreateSolanaToken, 
  verifyBridgeCompatibility,
  simulateBridgeDeposit 
} = require("./helpers/multichain");

describe("Solana Bridge Integration", function () {
  let tokenL1;
  let owner, user;
  let mockSolanaAddress;
  
  const WORMHOLE_ETHEREUM = "0x3ee18B2214AFF97000D974cf647E7C347E8fa585";
  const MOCK_WORMHOLE_RELAYER = "0x0000000000000000000000000000000000000001";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy L1 token
    const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
    tokenL1 = await TokenBotL1.deploy();
    await tokenL1.waitForDeployment();
    
    // Transfer some tokens to user for testing
    await tokenL1.transfer(user.address, ethers.parseEther("1000"));
    
    // Mock Solana token creation
    mockSolanaAddress = await mockCreateSolanaToken();
  });

  describe("Solana Token Creation", function () {
    it("Should generate valid Solana address format", async function () {
      expect(mockSolanaAddress).to.be.a("string");
      expect(mockSolanaAddress.length).to.be.within(32, 44);
      // Solana addresses are base58 encoded
      expect(mockSolanaAddress).to.match(/^[1-9A-HJ-NP-Za-km-z]+$/);
    });

    it("Should generate unique addresses", async function () {
      const addresses = new Set();
      for (let i = 0; i < 10; i++) {
        const addr = await mockCreateSolanaToken();
        addresses.add(addr);
      }
      expect(addresses.size).to.equal(10);
    });
  });

  describe("Wormhole Bridge Compatibility", function () {
    it("Should verify token is bridge compatible", async function () {
      const compatibility = await verifyBridgeCompatibility(tokenL1);
      
      expect(compatibility.isERC20).to.be.true;
      expect(compatibility.hasApprove).to.be.true;
      expect(compatibility.hasTransferFrom).to.be.true;
      expect(compatibility.decimals).to.equal(18);
      expect(compatibility.isPausable).to.be.true;
    });

    it("Should handle Wormhole token locking", async function () {
      const bridgeAmount = ethers.parseEther("100");
      
      // Simulate bridge deposit
      const result = await simulateBridgeDeposit(
        tokenL1,
        WORMHOLE_ETHEREUM,
        user,
        bridgeAmount
      );
      
      expect(result.success).to.be.true;
      expect(result.userBalanceDiff).to.equal(bridgeAmount);
      expect(result.bridgeBalanceDiff).to.equal(bridgeAmount);
    });

    it("Should emit correct events for bridging", async function () {
      const amount = ethers.parseEther("50");
      
      // Approve
      await expect(tokenL1.connect(user).approve(WORMHOLE_ETHEREUM, amount))
        .to.emit(tokenL1, "Approval")
        .withArgs(user.address, WORMHOLE_ETHEREUM, amount);
      
      // Transfer (lock)
      await expect(tokenL1.connect(user).transfer(WORMHOLE_ETHEREUM, amount))
        .to.emit(tokenL1, "Transfer")
        .withArgs(user.address, WORMHOLE_ETHEREUM, amount);
    });
  });

  describe("Cross-Chain Metadata", function () {
    it("Should maintain token metadata across chains", async function () {
      const metadata = {
        ethereum: {
          name: await tokenL1.name(),
          symbol: await tokenL1.symbol(),
          decimals: await tokenL1.decimals(),
          totalSupply: await tokenL1.totalSupply()
        },
        solana: {
          name: "TokenBot", // Would be same
          symbol: "TBOT",    // Would be same
          decimals: 9,       // Solana standard
          totalSupply: 0     // Starts at 0, mints as bridged
        }
      };
      
      expect(metadata.ethereum.name).to.equal("TokenBot");
      expect(metadata.ethereum.symbol).to.equal("TBOT");
      expect(metadata.solana.name).to.equal(metadata.ethereum.name);
      expect(metadata.solana.symbol).to.equal(metadata.ethereum.symbol);
    });

    it("Should handle decimal conversion correctly", function () {
      const ethAmount = ethers.parseEther("100"); // 100 * 10^18
      const solanaDecimals = 9;
      const ethDecimals = 18;
      
      // Convert ETH amount to Solana amount
      const divisor = BigInt(10) ** BigInt(ethDecimals - solanaDecimals);
      const solanaAmount = ethAmount / divisor;
      
      expect(solanaAmount).to.equal(BigInt("100000000000")); // 100 * 10^9
    });
  });

  describe("Bridge Security", function () {
    it("Should prevent bridging when paused", async function () {
      const amount = ethers.parseEther("10");
      
      // Pause token
      await tokenL1.pause();
      
      // Approve should still work
      await expect(tokenL1.connect(user).approve(WORMHOLE_ETHEREUM, amount))
        .to.not.be.reverted;
      
      // But transfer should fail
      await expect(tokenL1.connect(user).transfer(WORMHOLE_ETHEREUM, amount))
        .to.be.revertedWithCustomError(tokenL1, "EnforcedPause");
    });

    it("Should enforce allowance limits", async function () {
      const approvedAmount = ethers.parseEther("50");
      const attemptAmount = ethers.parseEther("100");
      
      // Approve less than attempt amount
      await tokenL1.connect(user).approve(owner.address, approvedAmount);
      
      // Try to transferFrom more than approved
      await expect(
        tokenL1.connect(owner).transferFrom(user.address, WORMHOLE_ETHEREUM, attemptAmount)
      ).to.be.revertedWithCustomError(tokenL1, "ERC20InsufficientAllowance");
    });
  });

  describe("Multi-Bridge Scenario", function () {
    it("Should support multiple bridge approvals", async function () {
      const BASE_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
      const amount1 = ethers.parseEther("100");
      const amount2 = ethers.parseEther("200");
      
      // Approve both bridges
      await tokenL1.connect(user).approve(WORMHOLE_ETHEREUM, amount1);
      await tokenL1.connect(user).approve(BASE_BRIDGE, amount2);
      
      // Check allowances
      expect(await tokenL1.allowance(user.address, WORMHOLE_ETHEREUM)).to.equal(amount1);
      expect(await tokenL1.allowance(user.address, BASE_BRIDGE)).to.equal(amount2);
    });

    it("Should track bridge balances separately", async function () {
      const BASE_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
      const amount1 = ethers.parseEther("30");
      const amount2 = ethers.parseEther("40");
      
      // Bridge to Wormhole
      await tokenL1.connect(user).transfer(WORMHOLE_ETHEREUM, amount1);
      
      // Bridge to Base
      await tokenL1.connect(user).transfer(BASE_BRIDGE, amount2);
      
      // Check balances
      expect(await tokenL1.balanceOf(WORMHOLE_ETHEREUM)).to.equal(amount1);
      expect(await tokenL1.balanceOf(BASE_BRIDGE)).to.equal(amount2);
      expect(await tokenL1.balanceOf(user.address)).to.equal(
        ethers.parseEther("1000") - amount1 - amount2
      );
    });
  });
});