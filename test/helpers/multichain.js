const { ethers } = require("hardhat");

/**
 * Calculate deterministic L2 address for Base bridge
 * This is a simplified version - actual Base bridge uses more complex logic
 */
function calculateL2TokenAddress(l1Token, l2Bridge) {
  // Base uses CREATE2 with specific salt pattern
  const salt = ethers.solidityPackedKeccak256(
    ["address", "address"],
    [l1Token, l2Bridge]
  );
  
  // Simplified bytecode hash for OptimismMintableERC20
  const initCodeHash = "0x" + "a".repeat(64); // Placeholder
  
  return ethers.getCreate2Address(
    l2Bridge,
    salt,
    initCodeHash
  );
}

/**
 * Mock Solana token creation for testing
 */
async function mockCreateSolanaToken() {
  // Generate mock Solana address (base58 format)
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "";
  for (let i = 0; i < 44; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

/**
 * Verify bridge compatibility for a token
 */
async function verifyBridgeCompatibility(token) {
  const checks = {
    isERC20: false,
    hasApprove: false,
    hasTransferFrom: false,
    decimals: 0,
    isPausable: false
  };

  try {
    // Check ERC20 interface
    checks.decimals = await token.decimals();
    checks.isERC20 = checks.decimals > 0;

    // Check for approve function
    const approveFunction = token.interface.getFunction("approve");
    checks.hasApprove = !!approveFunction;

    // Check for transferFrom function
    const transferFromFunction = token.interface.getFunction("transferFrom");
    checks.hasTransferFrom = !!transferFromFunction;

    // Check if pausable
    try {
      await token.paused();
      checks.isPausable = true;
    } catch {
      checks.isPausable = false;
    }
  } catch (error) {
    console.error("Bridge compatibility check failed:", error);
  }

  return checks;
}

/**
 * Simulate bridge deposit transaction
 */
async function simulateBridgeDeposit(token, bridge, user, amount) {
  // Approve bridge
  await token.connect(user).approve(bridge, amount);
  
  // Get initial balances
  const userBalanceBefore = await token.balanceOf(user.address);
  const bridgeBalanceBefore = await token.balanceOf(bridge);
  
  // Transfer to bridge (simulating lock)
  await token.connect(user).transfer(bridge, amount);
  
  // Verify balances
  const userBalanceAfter = await token.balanceOf(user.address);
  const bridgeBalanceAfter = await token.balanceOf(bridge);
  
  return {
    userBalanceDiff: userBalanceBefore - userBalanceAfter,
    bridgeBalanceDiff: bridgeBalanceAfter - bridgeBalanceBefore,
    success: (userBalanceBefore - userBalanceAfter).toString() === amount.toString()
  };
}

/**
 * Generate test deployment configuration
 */
function generateTestConfig(overrides = {}) {
  return {
    networks: {
      ethereum: {
        chainId: 1,
        rpcUrl: "https://eth-mainnet.example.com",
        explorer: "https://etherscan.io"
      },
      base: {
        chainId: 8453,
        rpcUrl: "https://base-mainnet.example.com",
        explorer: "https://basescan.org"
      },
      solana: {
        cluster: "mainnet-beta",
        rpcUrl: "https://api.mainnet-beta.solana.com",
        explorer: "https://solscan.io"
      }
    },
    bridges: {
      base: {
        l1Bridge: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
        l2Bridge: "0x4200000000000000000000000000000000000010"
      },
      wormhole: {
        ethereum: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
        solana: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"
      }
    },
    ...overrides
  };
}

module.exports = {
  calculateL2TokenAddress,
  mockCreateSolanaToken,
  verifyBridgeCompatibility,
  simulateBridgeDeposit,
  generateTestConfig
};