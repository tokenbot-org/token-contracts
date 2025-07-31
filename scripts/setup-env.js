#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { Writable } = require("stream");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Muted output stream for password input
const mutableStdout = new Writable({
  write: function (chunk, encoding, callback) {
    if (!this.muted) process.stdout.write(chunk, encoding);
    callback();
  }
});

mutableStdout.muted = false;

async function askQuestion(query, hideInput = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: hideInput ? mutableStdout : process.stdout,
    terminal: true
  });

  return new Promise(resolve => {
    if (hideInput) {
      mutableStdout.muted = false;
      mutableStdout.write(query);
      mutableStdout.muted = true;
    }

    rl.question(hideInput ? "" : query, ans => {
      rl.close();
      if (hideInput) {
        mutableStdout.muted = false;
        console.log(""); // New line after hidden input
      }
      resolve(ans.trim());
    });
  });
}

async function setupEnvironment() {
  console.log(`${colors.bright}${colors.blue}🔧 TokenBot Environment Setup${colors.reset}`);
  console.log("==============================\n");

  const envPath = path.join(__dirname, "..", ".env");
  const envExamplePath = path.join(__dirname, "..", ".env.example");

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await askQuestion(
      `${colors.yellow}⚠️  .env file already exists. Do you want to overwrite it? (y/N): ${colors.reset}`
    );
    
    if (overwrite.toLowerCase() !== "y") {
      console.log(`${colors.cyan}ℹ️  Keeping existing .env file${colors.reset}`);
      return;
    }
  }

  console.log(`${colors.cyan}ℹ️  This script will help you set up your environment variables${colors.reset}`);
  console.log(`${colors.dim}   Press Enter to skip any optional value${colors.reset}\n`);

  const envConfig = {};

  // Essential deployment configuration
  console.log(`${colors.bright}${colors.magenta}🔐 Deployment Configuration${colors.reset}`);
  console.log("-------------------------\n");

  const privateKey = await askQuestion(
    `${colors.yellow}Enter your deployer private key (without 0x prefix): ${colors.reset}`,
    true
  );
  
  if (privateKey) {
    envConfig.DEPLOYER_PRIVATE_KEY = privateKey.replace(/^0x/, "");
  }

  // Network configuration
  console.log(`\n${colors.bright}${colors.magenta}🌐 Network Configuration${colors.reset}`);
  console.log("-------------------------\n");

  const useCustomRpc = await askQuestion(
    `${colors.cyan}Do you want to configure custom RPC endpoints? (y/N): ${colors.reset}`
  );

  if (useCustomRpc.toLowerCase() === "y") {
    const ethMainnetRpc = await askQuestion(
      `${colors.cyan}Ethereum Mainnet RPC URL (default: Alchemy demo): ${colors.reset}`
    );
    if (ethMainnetRpc) envConfig.ETHEREUM_MAINNET_RPC = ethMainnetRpc;

    const ethSepoliaRpc = await askQuestion(
      `${colors.cyan}Ethereum Sepolia RPC URL (default: Alchemy demo): ${colors.reset}`
    );
    if (ethSepoliaRpc) envConfig.ETHEREUM_SEPOLIA_RPC = ethSepoliaRpc;

    const baseMainnetRpc = await askQuestion(
      `${colors.cyan}Base Mainnet RPC URL (default: https://mainnet.base.org): ${colors.reset}`
    );
    if (baseMainnetRpc) envConfig.BASE_MAINNET_RPC = baseMainnetRpc;

    const baseSepoliaRpc = await askQuestion(
      `${colors.cyan}Base Sepolia RPC URL (default: https://sepolia.base.org): ${colors.reset}`
    );
    if (baseSepoliaRpc) envConfig.BASE_SEPOLIA_RPC = baseSepoliaRpc;
  }

  // Block explorer API keys
  console.log(`\n${colors.bright}${colors.magenta}🔍 Block Explorer Configuration${colors.reset}`);
  console.log("--------------------------------\n");

  const etherscanKey = await askQuestion(
    `${colors.cyan}Etherscan API key (for contract verification): ${colors.reset}`
  );
  if (etherscanKey) envConfig.ETHERSCAN_API_KEY = etherscanKey;

  const basescanKey = await askQuestion(
    `${colors.cyan}Basescan API key (for contract verification): ${colors.reset}`
  );
  if (basescanKey) envConfig.BASESCAN_API_KEY = basescanKey;

  // Advanced options
  const advancedSetup = await askQuestion(
    `\n${colors.cyan}Configure advanced options? (y/N): ${colors.reset}`
  );

  if (advancedSetup.toLowerCase() === "y") {
    console.log(`\n${colors.bright}${colors.magenta}⚙️  Advanced Options${colors.reset}`);
    console.log("-------------------\n");

    const gasPrice = await askQuestion(
      `${colors.cyan}Gas price in gwei (leave empty for auto): ${colors.reset}`
    );
    if (gasPrice) envConfig.GAS_PRICE_GWEI = gasPrice;

    const confirmations = await askQuestion(
      `${colors.cyan}Deployment confirmations (default: 2): ${colors.reset}`
    );
    if (confirmations) envConfig.CONFIRMATIONS = confirmations;

    const slackWebhook = await askQuestion(
      `${colors.cyan}Slack webhook URL for notifications (optional): ${colors.reset}`
    );
    if (slackWebhook) envConfig.SLACK_WEBHOOK_URL = slackWebhook;

    const discordWebhook = await askQuestion(
      `${colors.cyan}Discord webhook URL for notifications (optional): ${colors.reset}`
    );
    if (discordWebhook) envConfig.DISCORD_WEBHOOK_URL = discordWebhook;
  }

  // Generate .env file
  console.log(`\n${colors.bright}${colors.green}✍️  Generating .env file...${colors.reset}`);

  let envContent = "# TokenBot Environment Variables\n";
  envContent += "# Generated by setup-env.js\n";
  envContent += `# Date: ${new Date().toISOString()}\n\n`;

  // Read .env.example to maintain structure
  if (fs.existsSync(envExamplePath)) {
    const exampleContent = fs.readFileSync(envExamplePath, "utf8");
    const lines = exampleContent.split("\n");

    for (const line of lines) {
      if (line.startsWith("#") || line.trim() === "") {
        envContent += line + "\n";
      } else {
        const [key] = line.split("=");
        if (key && envConfig[key.trim()]) {
          envContent += `${key.trim()}=${envConfig[key.trim()]}\n`;
        } else if (key && !line.includes("=")) {
          envContent += line + "\n";
        }
      }
    }
  } else {
    // Fallback if .env.example doesn't exist
    for (const [key, value] of Object.entries(envConfig)) {
      envContent += `${key}=${value}\n`;
    }
  }

  fs.writeFileSync(envPath, envContent);

  console.log(`${colors.bright}${colors.green}✅ Environment file created successfully!${colors.reset}`);
  console.log(`${colors.dim}   Location: ${envPath}${colors.reset}\n`);

  // Security reminder
  console.log(`${colors.bright}${colors.yellow}⚠️  Security Reminders:${colors.reset}`);
  console.log(`${colors.yellow}   1. Never commit your .env file to git${colors.reset}`);
  console.log(`${colors.yellow}   2. Keep your private keys secure${colors.reset}`);
  console.log(`${colors.yellow}   3. Use different keys for testnet and mainnet${colors.reset}`);
  console.log(`${colors.yellow}   4. Consider using a hardware wallet for mainnet${colors.reset}\n`);

  // Next steps
  console.log(`${colors.bright}${colors.cyan}📋 Next Steps:${colors.reset}`);
  console.log(`${colors.cyan}   1. Review your .env file${colors.reset}`);
  console.log(`${colors.cyan}   2. Test deployment on testnet first${colors.reset}`);
  console.log(`${colors.cyan}   3. Run: npm run deploy:l1:testnet${colors.reset}`);
  console.log(`${colors.cyan}   4. Or: npm run deploy:l2:testnet${colors.reset}\n`);
}

// Run the setup
setupEnvironment()
  .then(() => {
    console.log(`${colors.bright}${colors.green}🎉 Setup complete!${colors.reset}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.bright}${colors.red}❌ Setup failed:${colors.reset}`, error);
    process.exit(1);
  });