const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenBot", function () {
  // Constants
  const TOKEN_NAME = "TokenBot";
  const TOKEN_SYMBOL = "TBOT";
  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Deploy fixture
  async function deployTokenBotFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const TokenBot = await ethers.getContractFactory("TokenBot");
    const tokenBot = await TokenBot.deploy();
    
    return { tokenBot, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      const { tokenBot } = await loadFixture(deployTokenBotFixture);
      
      expect(await tokenBot.name()).to.equal(TOKEN_NAME);
      expect(await tokenBot.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should mint total supply to deployer", async function () {
      const { tokenBot, owner } = await loadFixture(deployTokenBotFixture);
      
      expect(await tokenBot.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await tokenBot.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      const { tokenBot, owner } = await loadFixture(deployTokenBotFixture);
      
      expect(await tokenBot.owner()).to.equal(owner.address);
    });

    it("Should have 18 decimals", async function () {
      const { tokenBot } = await loadFixture(deployTokenBotFixture);
      
      expect(await tokenBot.decimals()).to.equal(18);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { tokenBot, owner, addr1, addr2 } = await loadFixture(deployTokenBotFixture);
      const amount = ethers.parseEther("100");

      // Transfer from owner to addr1
      await expect(tokenBot.transfer(addr1.address, amount))
        .to.emit(tokenBot, "Transfer")
        .withArgs(owner.address, addr1.address, amount);

      expect(await tokenBot.balanceOf(addr1.address)).to.equal(amount);

      // Transfer from addr1 to addr2
      await expect(tokenBot.connect(addr1).transfer(addr2.address, amount))
        .to.emit(tokenBot, "Transfer")
        .withArgs(addr1.address, addr2.address, amount);

      expect(await tokenBot.balanceOf(addr2.address)).to.equal(amount);
      expect(await tokenBot.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);
      const initialOwnerBalance = await tokenBot.balanceOf(owner.address);

      await expect(
        tokenBot.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(tokenBot, "ERC20InsufficientBalance");

      expect(await tokenBot.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should fail when transferring to zero address", async function () {
      const { tokenBot, owner } = await loadFixture(deployTokenBotFixture);

      await expect(
        tokenBot.transfer(ZERO_ADDRESS, 100)
      ).to.be.revertedWithCustomError(tokenBot, "ERC20InvalidReceiver");
    });
  });

  describe("Allowances", function () {
    it("Should approve and transferFrom correctly", async function () {
      const { tokenBot, owner, addr1, addr2 } = await loadFixture(deployTokenBotFixture);
      const amount = ethers.parseEther("100");

      // Approve addr1 to spend owner's tokens
      await expect(tokenBot.approve(addr1.address, amount))
        .to.emit(tokenBot, "Approval")
        .withArgs(owner.address, addr1.address, amount);

      // Check allowance
      expect(await tokenBot.allowance(owner.address, addr1.address)).to.equal(amount);

      // Transfer from owner to addr2 using addr1
      await expect(
        tokenBot.connect(addr1).transferFrom(owner.address, addr2.address, amount)
      )
        .to.emit(tokenBot, "Transfer")
        .withArgs(owner.address, addr2.address, amount);

      expect(await tokenBot.balanceOf(addr2.address)).to.equal(amount);
      expect(await tokenBot.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      const { tokenBot, owner, addr1, addr2 } = await loadFixture(deployTokenBotFixture);
      const amount = ethers.parseEther("100");

      await tokenBot.approve(addr1.address, amount);

      await expect(
        tokenBot.connect(addr1).transferFrom(owner.address, addr2.address, amount + 1n)
      ).to.be.revertedWithCustomError(tokenBot, "ERC20InsufficientAllowance");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      const { tokenBot, owner } = await loadFixture(deployTokenBotFixture);
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await tokenBot.balanceOf(owner.address);
      const initialSupply = await tokenBot.totalSupply();

      await expect(tokenBot.burn(burnAmount))
        .to.emit(tokenBot, "Transfer")
        .withArgs(owner.address, ZERO_ADDRESS, burnAmount);

      expect(await tokenBot.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
      expect(await tokenBot.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should allow burning tokens with approval", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);
      const burnAmount = ethers.parseEther("1000");

      // Transfer tokens to addr1
      await tokenBot.transfer(addr1.address, burnAmount * 2n);
      
      // Approve owner to burn addr1's tokens
      await tokenBot.connect(addr1).approve(owner.address, burnAmount);

      const initialBalance = await tokenBot.balanceOf(addr1.address);
      const initialSupply = await tokenBot.totalSupply();

      await expect(tokenBot.burnFrom(addr1.address, burnAmount))
        .to.emit(tokenBot, "Transfer")
        .withArgs(addr1.address, ZERO_ADDRESS, burnAmount);

      expect(await tokenBot.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await tokenBot.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should fail when burning more than balance", async function () {
      const { tokenBot, addr1 } = await loadFixture(deployTokenBotFixture);

      await expect(
        tokenBot.connect(addr1).burn(1)
      ).to.be.revertedWithCustomError(tokenBot, "ERC20InsufficientBalance");
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { tokenBot, owner } = await loadFixture(deployTokenBotFixture);

      // Pause
      await expect(tokenBot.pause())
        .to.emit(tokenBot, "Paused")
        .withArgs(owner.address);

      expect(await tokenBot.paused()).to.be.true;

      // Unpause
      await expect(tokenBot.unpause())
        .to.emit(tokenBot, "Unpaused")
        .withArgs(owner.address);

      expect(await tokenBot.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);

      await tokenBot.pause();

      await expect(
        tokenBot.transfer(addr1.address, 100)
      ).to.be.revertedWithCustomError(tokenBot, "EnforcedPause");
    });

    it("Should prevent non-owner from pausing", async function () {
      const { tokenBot, addr1 } = await loadFixture(deployTokenBotFixture);

      await expect(
        tokenBot.connect(addr1).pause()
      ).to.be.revertedWithCustomError(tokenBot, "OwnableUnauthorizedAccount");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);

      await expect(tokenBot.transferOwnership(addr1.address))
        .to.emit(tokenBot, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);

      expect(await tokenBot.owner()).to.equal(addr1.address);
    });

    it("Should renounce ownership", async function () {
      const { tokenBot, owner } = await loadFixture(deployTokenBotFixture);

      await expect(tokenBot.renounceOwnership())
        .to.emit(tokenBot, "OwnershipTransferred")
        .withArgs(owner.address, ZERO_ADDRESS);

      expect(await tokenBot.owner()).to.equal(ZERO_ADDRESS);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      const { tokenBot, addr1, addr2 } = await loadFixture(deployTokenBotFixture);

      await expect(
        tokenBot.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWithCustomError(tokenBot, "OwnableUnauthorizedAccount");
    });
  });

  describe("Permit (EIP-2612)", function () {
    it("Should execute permit for gasless approvals", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);
      const amount = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      // Get domain separator
      const domain = {
        name: TOKEN_NAME,
        version: "1",
        chainId: 31337, // Hardhat default
        verifyingContract: await tokenBot.getAddress()
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
        nonce: await tokenBot.nonces(owner.address),
        deadline: deadline
      };

      // Sign permit
      const signature = await owner.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);

      // Execute permit
      await tokenBot.permit(
        owner.address,
        addr1.address,
        amount,
        deadline,
        v,
        r,
        s
      );

      expect(await tokenBot.allowance(owner.address, addr1.address)).to.equal(amount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 approval", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);
      const maxUint256 = ethers.MaxUint256;

      await tokenBot.approve(addr1.address, maxUint256);
      expect(await tokenBot.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });

    it("Should correctly handle zero amount transfers", async function () {
      const { tokenBot, owner, addr1 } = await loadFixture(deployTokenBotFixture);

      await expect(tokenBot.transfer(addr1.address, 0))
        .to.emit(tokenBot, "Transfer")
        .withArgs(owner.address, addr1.address, 0);
    });
  });
});