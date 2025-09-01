const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
const bip39 = require("bip39");
const { derivePath } = require("ed25519-hd-key");

/**
 * Parse Solana private key from various formats including BIP39 mnemonic
 * @param {string} privateKeyOrMnemonic - Private key in base58 (Phantom), base64, JSON array, or BIP39 mnemonic format
 * @param {number} accountIndex - Account index for HD derivation (default: 0)
 * @returns {Keypair} Solana Keypair object
 */
function parsePrivateKey(privateKeyOrMnemonic, accountIndex = 0) {
  try {
    // Check if it's a BIP39 mnemonic (12 or 24 words)
    const words = privateKeyOrMnemonic.trim().split(/\s+/);
    if (words.length === 12 || words.length === 24) {
      // Validate mnemonic
      if (bip39.validateMnemonic(privateKeyOrMnemonic)) {
        const seed = bip39.mnemonicToSeedSync(privateKeyOrMnemonic);
        // Standard Solana derivation path
        const path = `m/44'/501'/${accountIndex}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        return Keypair.fromSeed(derivedSeed);
      }
    }

    // Try parsing as JSON array first (legacy format)
    if (privateKeyOrMnemonic.startsWith("[") || privateKeyOrMnemonic.startsWith("{")) {
      const parsed = JSON.parse(privateKeyOrMnemonic);
      const secretKey = Array.isArray(parsed) ? parsed : parsed.secretKey;
      return Keypair.fromSecretKey(Uint8Array.from(secretKey));
    }

    // Try base58 format (Phantom wallet export)
    try {
      const decoded = bs58.default.decode(privateKeyOrMnemonic);
      return Keypair.fromSecretKey(decoded);
    } catch (e) {
      // Not base58, continue
    }

    // Try base64 format
    try {
      const decoded = Buffer.from(privateKeyOrMnemonic, "base64");
      return Keypair.fromSecretKey(decoded);
    } catch (e) {
      // Not base64, continue
    }

    throw new Error("Unable to parse private key format");
  } catch (error) {
    throw new Error(`Invalid private key or mnemonic format: ${error.message}. Supported formats: BIP39 mnemonic (12/24 words), base58 (Phantom), base64, or JSON array`);
  }
}

module.exports = {
  parsePrivateKey
};