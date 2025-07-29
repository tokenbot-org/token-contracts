const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenBotL2", function () {
  // Constants
  const TOKEN_NAME = "TokenBot";
  const TOKEN_SYMBOL = "TBOT";
  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Deploy fixture
  async function deployTokenBotL2Fixture () {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const TokenBotL2 = await ethers.getContractFactory("TokenBotL2");
    const tokenBotL2 = await TokenBotL2.deploy();

    return { tokenBotL2, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      const { tokenBotL2 } = await loadFixture(deployTokenBotL2Fixture);

      expect(await tokenBotL2.name()).to.equal(TOKEN_NAME);
      expect(await tokenBotL2.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should mint total supply to deployer", async function () {
      const { tokenBotL2, owner } = await loadFixture(deployTokenBotL2Fixture);

      expect(await tokenBotL2.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await tokenBotL2.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      const { tokenBotL2, owner } = await loadFixture(deployTokenBotL2Fixture);

      expect(await tokenBotL2.owner()).to.equal(owner.address);
    });

    it("Should have 18 decimals", async function () {
      const { tokenBotL2 } = await loadFixture(deployTokenBotL2Fixture);

      expect(await tokenBotL2.decimals()).to.equal(18);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { tokenBotL2, owner, addr1, addr2 } = await loadFixture(deployTokenBotL2Fixture);
      const amount = ethers.parseEther("100");

      // Transfer from owner to addr1
      await expect(tokenBotL2.transfer(addr1.address, amount))
        .to.emit(tokenBotL2, "Transfer")
        .withArgs(owner.address, addr1.address, amount);

      expect(await tokenBotL2.balanceOf(addr1.address)).to.equal(amount);

      // Transfer from addr1 to addr2
      await expect(tokenBotL2.connect(addr1).transfer(addr2.address, amount))
        .to.emit(tokenBotL2, "Transfer")
        .withArgs(addr1.address, addr2.address, amount);

      expect(await tokenBotL2.balanceOf(addr2.address)).to.equal(amount);
      expect(await tokenBotL2.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { tokenBotL2, owner, addr1 } = await loadFixture(deployTokenBotL2Fixture);
      const initialOwnerBalance = await tokenBotL2.balanceOf(owner.address);

      await expect(tokenBotL2.connect(addr1).transfer(owner.address, 1)).to.be.revertedWithCustomError(
        tokenBotL2,
        "ERC20InsufficientBalance"
      );

      expect(await tokenBotL2.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should fail when transferring to zero address", async function () {
      const { tokenBotL2 } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.transfer(ZERO_ADDRESS, 100)).to.be.revertedWithCustomError(
        tokenBotL2,
        "ERC20InvalidReceiver"
      );
    });
  });

  describe("Allowances", function () {
    it("Should approve and transferFrom correctly", async function () {
      const { tokenBotL2, owner, addr1, addr2 } = await loadFixture(deployTokenBotL2Fixture);
      const amount = ethers.parseEther("100");

      // Approve addr1 to spend owner's tokens
      await expect(tokenBotL2.approve(addr1.address, amount))
        .to.emit(tokenBotL2, "Approval")
        .withArgs(owner.address, addr1.address, amount);

      // Check allowance
      expect(await tokenBotL2.allowance(owner.address, addr1.address)).to.equal(amount);

      // Transfer from owner to addr2 using addr1
      await expect(tokenBotL2.connect(addr1).transferFrom(owner.address, addr2.address, amount))
        .to.emit(tokenBotL2, "Transfer")
        .withArgs(owner.address, addr2.address, amount);

      expect(await tokenBotL2.balanceOf(addr2.address)).to.equal(amount);
      expect(await tokenBotL2.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      const { tokenBotL2, owner, addr1, addr2 } = await loadFixture(deployTokenBotL2Fixture);
      const amount = ethers.parseEther("100");

      await tokenBotL2.approve(addr1.address, amount);

      await expect(
        tokenBotL2.connect(addr1).transferFrom(owner.address, addr2.address, amount + 1n)
      ).to.be.revertedWithCustomError(tokenBotL2, "ERC20InsufficientAllowance");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      const { tokenBotL2, owner } = await loadFixture(deployTokenBotL2Fixture);
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await tokenBotL2.balanceOf(owner.address);
      const initialSupply = await tokenBotL2.totalSupply();

      await expect(tokenBotL2.burn(burnAmount))
        .to.emit(tokenBotL2, "Transfer")
        .withArgs(owner.address, ZERO_ADDRESS, burnAmount);

      expect(await tokenBotL2.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
      expect(await tokenBotL2.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should allow burning tokens with approval", async function () {
      const { tokenBotL2, owner, addr1 } = await loadFixture(deployTokenBotL2Fixture);
      const burnAmount = ethers.parseEther("1000");

      // Transfer tokens to addr1
      await tokenBotL2.transfer(addr1.address, burnAmount * 2n);

      // Approve owner to burn addr1's tokens
      await tokenBotL2.connect(addr1).approve(owner.address, burnAmount);

      const initialBalance = await tokenBotL2.balanceOf(addr1.address);
      const initialSupply = await tokenBotL2.totalSupply();

      await expect(tokenBotL2.burnFrom(addr1.address, burnAmount))
        .to.emit(tokenBotL2, "Transfer")
        .withArgs(addr1.address, ZERO_ADDRESS, burnAmount);

      expect(await tokenBotL2.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await tokenBotL2.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should fail when burning more than balance", async function () {
      const { tokenBotL2, addr1 } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.connect(addr1).burn(1)).to.be.revertedWithCustomError(
        tokenBotL2,
        "ERC20InsufficientBalance"
      );
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { tokenBotL2, owner } = await loadFixture(deployTokenBotL2Fixture);

      // Pause
      await expect(tokenBotL2.pause()).to.emit(tokenBotL2, "Paused").withArgs(owner.address);

      expect(await tokenBotL2.paused()).to.be.true;

      // Unpause
      await expect(tokenBotL2.unpause()).to.emit(tokenBotL2, "Unpaused").withArgs(owner.address);

      expect(await tokenBotL2.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      const { tokenBotL2, addr1 } = await loadFixture(deployTokenBotL2Fixture);

      await tokenBotL2.pause();

      await expect(tokenBotL2.transfer(addr1.address, 100)).to.be.revertedWithCustomError(tokenBotL2, "EnforcedPause");
    });

    it("Should prevent non-owner from pausing", async function () {
      const { tokenBotL2, addr1 } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.connect(addr1).pause()).to.be.revertedWithCustomError(
        tokenBotL2,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      const { tokenBotL2, owner, addr1 } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.transferOwnership(addr1.address))
        .to.emit(tokenBotL2, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);

      expect(await tokenBotL2.owner()).to.equal(addr1.address);
    });

    it("Should renounce ownership", async function () {
      const { tokenBotL2, owner } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.renounceOwnership())
        .to.emit(tokenBotL2, "OwnershipTransferred")
        .withArgs(owner.address, ZERO_ADDRESS);

      expect(await tokenBotL2.owner()).to.equal(ZERO_ADDRESS);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      const { tokenBotL2, addr1, addr2 } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.connect(addr1).transferOwnership(addr2.address)).to.be.revertedWithCustomError(
        tokenBotL2,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Permit (EIP-2612)", function () {
    it("Should execute permit for gasless approvals", async function () {
      const { tokenBotL2, owner, addr1 } = await loadFixture(deployTokenBotL2Fixture);
      const amount = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      // Get domain separator
      const domain = {
        name: TOKEN_NAME,
        version: "1",
        chainId: 31337, // Hardhat default
        verifyingContract: await tokenBotL2.getAddress()
      };

      // Create permit message
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      const value = {
        owner: owner.address,
        spender: addr1.address,
        value: amount,
        nonce: await tokenBotL2.nonces(owner.address),
        deadline
      };

      // Sign permit
      const signature = await owner.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);

      // Execute permit
      await tokenBotL2.permit(owner.address, addr1.address, amount, deadline, v, r, s);

      expect(await tokenBotL2.allowance(owner.address, addr1.address)).to.equal(amount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 approval", async function () {
      const { tokenBotL2, owner, addr1 } = await loadFixture(deployTokenBotL2Fixture);
      const maxUint256 = ethers.MaxUint256;

      await tokenBotL2.approve(addr1.address, maxUint256);
      expect(await tokenBotL2.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });

    it("Should correctly handle zero amount transfers", async function () {
      const { tokenBotL2, owner, addr1 } = await loadFixture(deployTokenBotL2Fixture);

      await expect(tokenBotL2.transfer(addr1.address, 0))
        .to.emit(tokenBotL2, "Transfer")
        .withArgs(owner.address, addr1.address, 0);
    });
  });
});
