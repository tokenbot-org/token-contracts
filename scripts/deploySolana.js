const { Connection, Keypair, SystemProgram, Transaction } = require("@solana/web3.js");
const {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction
} = require("@solana/spl-token");
const path = require("path");
const fs = require("fs");
const { parsePrivateKey } = require("./utils/solana");
require("dotenv").config();

async function main() {
  try {
    console.log("\n🚀 Starting Solana Deployment");
    console.log("=".repeat(50));

    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    console.log("\n📍 Network: Solana");
    console.log(`   RPC: ${rpcUrl}`);

    const network = rpcUrl.includes("mainnet") ? "mainnet-beta" : rpcUrl.includes("testnet") ? "testnet" : "devnet";
    console.log(`   Network Type: ${network}`);

    let deployerKeypair;
    if (process.env.SOLANA_MNEMONIC) {
      try {
        const accountIndex = process.env.SOLANA_ACCOUNT_INDEX ? parseInt(process.env.SOLANA_ACCOUNT_INDEX) : 0;
        deployerKeypair = parsePrivateKey(process.env.SOLANA_MNEMONIC, accountIndex);
        console.log(`   ✅ Mnemonic loaded successfully (account index: ${accountIndex})`);
      } catch (error) {
        console.error("   ❌ Failed to parse mnemonic:", error.message);
        process.exit(1);
      }
    } else if (process.env.SOLANA_PRIVATE_KEY) {
      try {
        deployerKeypair = parsePrivateKey(process.env.SOLANA_PRIVATE_KEY);
        console.log("   ✅ Private key loaded successfully");
      } catch (error) {
        console.error("   ❌ Failed to parse private key:", error.message);
        process.exit(1);
      }
    } else {
      console.log("⚠️  No SOLANA_MNEMONIC or SOLANA_PRIVATE_KEY found, generating new keypair");
      deployerKeypair = Keypair.generate();
      console.log("   Save this private key for future use (base58 format):");
      const bs58 = require("bs58");
      console.log(`   ${bs58.default.encode(deployerKeypair.secretKey)}`);
    }

    const balance = await connection.getBalance(deployerKeypair.publicKey);
    console.log(`\n👤 Deployer: ${deployerKeypair.publicKey.toString()}`);
    console.log(`   Balance: ${balance / 1000000000} SOL`);

    if (balance < 0.01 * 1000000000) {
      console.log("\n⚠️  Warning: Low balance. You may need to fund this account.");
      if (network === "devnet") {
        console.log("   Visit: https://solfaucet.com to get devnet SOL");
      }
    }

    console.log("\n📜 Creating SPL Token (TBOT)...");

    const mintKeypair = Keypair.generate();
    const decimals = 9;
    const totalSupply = 1000000000;

    const mintLen = getMintLen([]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: deployerKeypair.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_PROGRAM_ID
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        deployerKeypair.publicKey,
        deployerKeypair.publicKey,
        TOKEN_PROGRAM_ID
      )
    );

    console.log("   Creating mint account...");
    const signature = await connection.sendTransaction(transaction, [deployerKeypair, mintKeypair]);
    await connection.confirmTransaction(signature);
    console.log(`   ✅ Mint created: ${mintKeypair.publicKey.toString()}`);
    console.log(`   Transaction: ${signature}`);

    const associatedTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, deployerKeypair.publicKey);

    console.log("\n🏦 Creating Associated Token Account...");
    const ataTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        deployerKeypair.publicKey,
        associatedTokenAccount,
        deployerKeypair.publicKey,
        mintKeypair.publicKey
      )
    );

    const ataSignature = await connection.sendTransaction(ataTransaction, [deployerKeypair]);
    await connection.confirmTransaction(ataSignature);
    console.log(`   ✅ ATA created: ${associatedTokenAccount.toString()}`);

    console.log("\n💰 Minting initial supply...");
    const mintAmount = BigInt(totalSupply) * BigInt(10 ** decimals);
    const mintTransaction = new Transaction().add(
      createMintToInstruction(mintKeypair.publicKey, associatedTokenAccount, deployerKeypair.publicKey, mintAmount)
    );

    const mintSig = await connection.sendTransaction(mintTransaction, [deployerKeypair]);
    await connection.confirmTransaction(mintSig);
    console.log(`   ✅ Minted ${totalSupply.toLocaleString()} TBOT`);
    console.log(`   Transaction: ${mintSig}`);

    const deploymentData = {
      network: `solana-${network}`,
      mintAddress: mintKeypair.publicKey.toString(),
      decimals,
      totalSupply: totalSupply.toString(),
      deployer: deployerKeypair.publicKey.toString(),
      associatedTokenAccount: associatedTokenAccount.toString(),
      deployedAt: new Date().toISOString(),
      transactions: {
        createMint: signature,
        createATA: ataSignature,
        mintTokens: mintSig
      }
    };

    const deploymentDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, `solana-${network}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment data saved to: ${deploymentFile}`);

    console.log("\n" + "=".repeat(50));
    console.log("📊 SOLANA DEPLOYMENT SUMMARY");
    console.log("=".repeat(50));
    console.log(`Network: Solana ${network}`);
    console.log(`Token Mint: ${mintKeypair.publicKey.toString()}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${totalSupply.toLocaleString()} TBOT`);
    console.log(`Owner: ${deployerKeypair.publicKey.toString()}`);
    console.log("=".repeat(50));

    if (network === "mainnet-beta") {
      console.log("\n🌉 Bridge Information:");
      console.log("   Use Wormhole Portal to bridge TBOT to other chains:");
      console.log("   https://portalbridge.com");
    }

    console.log("\n✅ Solana deployment completed successfully!");
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
