const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenBotL1", function () {
  // Constants
  const TOKEN_NAME = "TokenBot";
  const TOKEN_SYMBOL = "TBOT";
  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Deploy fixture
  async function deployTokenBotL1Fixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const TokenBotL1 = await ethers.getContractFactory("TokenBotL1");
    const tokenBotL1 = await TokenBotL1.deploy();

    return { tokenBotL1, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      const { tokenBotL1 } = await loadFixture(deployTokenBotL1Fixture);

      expect(await tokenBotL1.name()).to.equal(TOKEN_NAME);
      expect(await tokenBotL1.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should mint total supply to deployer", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);

      expect(await tokenBotL1.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await tokenBotL1.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);

      expect(await tokenBotL1.owner()).to.equal(owner.address);
    });

    it("Should have 18 decimals", async function () {
      const { tokenBotL1 } = await loadFixture(deployTokenBotL1Fixture);

      expect(await tokenBotL1.decimals()).to.equal(18);
    });

    it("Should have correct total supply constant", async function () {
      const { tokenBotL1 } = await loadFixture(deployTokenBotL1Fixture);

      expect(await tokenBotL1.TOTAL_SUPPLY()).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { tokenBotL1, owner, addr1, addr2 } = await loadFixture(deployTokenBotL1Fixture);
      const amount = ethers.parseEther("100");

      // Transfer from owner to addr1
      await expect(tokenBotL1.transfer(addr1.address, amount))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(owner.address, addr1.address, amount);

      expect(await tokenBotL1.balanceOf(addr1.address)).to.equal(amount);

      // Transfer from addr1 to addr2
      await expect(tokenBotL1.connect(addr1).transfer(addr2.address, amount))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(addr1.address, addr2.address, amount);

      expect(await tokenBotL1.balanceOf(addr2.address)).to.equal(amount);
      expect(await tokenBotL1.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);
      const initialOwnerBalance = await tokenBotL1.balanceOf(owner.address);

      await expect(tokenBotL1.connect(addr1).transfer(owner.address, 1)).to.be.revertedWithCustomError(
        tokenBotL1,
        "ERC20InsufficientBalance"
      );

      expect(await tokenBotL1.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should fail when transferring to zero address", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.transfer(ZERO_ADDRESS, 100)).to.be.revertedWithCustomError(
        tokenBotL1,
        "ERC20InvalidReceiver"
      );
    });
  });

  describe("Allowances", function () {
    it("Should approve and transferFrom correctly", async function () {
      const { tokenBotL1, owner, addr1, addr2 } = await loadFixture(deployTokenBotL1Fixture);
      const amount = ethers.parseEther("100");

      // Approve addr1 to spend owner's tokens
      await expect(tokenBotL1.approve(addr1.address, amount))
        .to.emit(tokenBotL1, "Approval")
        .withArgs(owner.address, addr1.address, amount);

      // Check allowance
      expect(await tokenBotL1.allowance(owner.address, addr1.address)).to.equal(amount);

      // Transfer from owner to addr2 using addr1
      await expect(tokenBotL1.connect(addr1).transferFrom(owner.address, addr2.address, amount))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(owner.address, addr2.address, amount);

      expect(await tokenBotL1.balanceOf(addr2.address)).to.equal(amount);
      expect(await tokenBotL1.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      const { tokenBotL1, owner, addr1, addr2 } = await loadFixture(deployTokenBotL1Fixture);
      const amount = ethers.parseEther("100");

      await tokenBotL1.approve(addr1.address, amount);

      await expect(
        tokenBotL1.connect(addr1).transferFrom(owner.address, addr2.address, amount + 1n)
      ).to.be.revertedWithCustomError(tokenBotL1, "ERC20InsufficientAllowance");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await tokenBotL1.balanceOf(owner.address);
      const initialSupply = await tokenBotL1.totalSupply();

      await expect(tokenBotL1.burn(burnAmount))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(owner.address, ZERO_ADDRESS, burnAmount);

      expect(await tokenBotL1.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
      expect(await tokenBotL1.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should allow burning tokens with approval", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);
      const burnAmount = ethers.parseEther("1000");

      // Transfer tokens to addr1
      await tokenBotL1.transfer(addr1.address, burnAmount * 2n);

      // Approve owner to burn addr1's tokens
      await tokenBotL1.connect(addr1).approve(owner.address, burnAmount);

      const initialBalance = await tokenBotL1.balanceOf(addr1.address);
      const initialSupply = await tokenBotL1.totalSupply();

      await expect(tokenBotL1.burnFrom(addr1.address, burnAmount))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(addr1.address, ZERO_ADDRESS, burnAmount);

      expect(await tokenBotL1.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await tokenBotL1.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should fail when burning more than balance", async function () {
      const { tokenBotL1, addr1 } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.connect(addr1).burn(1)).to.be.revertedWithCustomError(
        tokenBotL1,
        "ERC20InsufficientBalance"
      );
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);

      // Pause
      await expect(tokenBotL1.pause()).to.emit(tokenBotL1, "Paused").withArgs(owner.address);

      expect(await tokenBotL1.paused()).to.be.true;

      // Unpause
      await expect(tokenBotL1.unpause()).to.emit(tokenBotL1, "Unpaused").withArgs(owner.address);

      expect(await tokenBotL1.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);

      await tokenBotL1.pause();

      await expect(tokenBotL1.transfer(addr1.address, 100)).to.be.revertedWithCustomError(tokenBotL1, "EnforcedPause");
    });

    it("Should prevent non-owner from pausing", async function () {
      const { tokenBotL1, addr1 } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.connect(addr1).pause()).to.be.revertedWithCustomError(
        tokenBotL1,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should prevent burning when paused", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);
      const burnAmount = ethers.parseEther("100");

      await tokenBotL1.pause();

      // Burning should also be prevented when paused
      await expect(tokenBotL1.burn(burnAmount)).to.be.revertedWithCustomError(tokenBotL1, "EnforcedPause");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.transferOwnership(addr1.address))
        .to.emit(tokenBotL1, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);

      expect(await tokenBotL1.owner()).to.equal(addr1.address);
    });

    it("Should renounce ownership", async function () {
      const { tokenBotL1, owner } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.renounceOwnership())
        .to.emit(tokenBotL1, "OwnershipTransferred")
        .withArgs(owner.address, ZERO_ADDRESS);

      expect(await tokenBotL1.owner()).to.equal(ZERO_ADDRESS);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      const { tokenBotL1, addr1, addr2 } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.connect(addr1).transferOwnership(addr2.address)).to.be.revertedWithCustomError(
        tokenBotL1,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Bridge Compatibility", function () {
    it("Should be compatible with standard bridge requirements", async function () {
      const { tokenBotL1 } = await loadFixture(deployTokenBotL1Fixture);

      // Check ERC20 interface compliance
      expect(await tokenBotL1.name()).to.equal(TOKEN_NAME);
      expect(await tokenBotL1.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await tokenBotL1.decimals()).to.equal(18);
      expect(await tokenBotL1.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should handle large bridge transactions", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);
      const largeAmount = ethers.parseEther("100000000"); // 100M tokens

      await expect(tokenBotL1.transfer(addr1.address, largeAmount))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(owner.address, addr1.address, largeAmount);

      expect(await tokenBotL1.balanceOf(addr1.address)).to.equal(largeAmount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 approval", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);
      const maxUint256 = ethers.MaxUint256;

      await tokenBotL1.approve(addr1.address, maxUint256);
      expect(await tokenBotL1.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });

    it("Should correctly handle zero amount transfers", async function () {
      const { tokenBotL1, owner, addr1 } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.transfer(addr1.address, 0))
        .to.emit(tokenBotL1, "Transfer")
        .withArgs(owner.address, addr1.address, 0);
    });

    it("Should prevent pausing when already paused", async function () {
      const { tokenBotL1 } = await loadFixture(deployTokenBotL1Fixture);

      await tokenBotL1.pause();

      await expect(tokenBotL1.pause()).to.be.revertedWithCustomError(tokenBotL1, "EnforcedPause");
    });

    it("Should prevent unpausing when not paused", async function () {
      const { tokenBotL1 } = await loadFixture(deployTokenBotL1Fixture);

      await expect(tokenBotL1.unpause()).to.be.revertedWithCustomError(tokenBotL1, "ExpectedPause");
    });
  });
});
