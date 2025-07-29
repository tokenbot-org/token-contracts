// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenBot L2
 * @dev Implementation of the TokenBot ERC-20 Token for Base L2 with advanced features
 * 
 * This contract creates a token with the following properties:
 * - Name: TokenBot
 * - Symbol: TBOT
 * - Decimals: 18 (standard)
 * - Initial Supply: 1,000,000,000 TBOT (minted to deployer)
 * 
 * Features:
 * - Burnable: Token holders can burn their tokens
 * - Pausable: Owner can pause all token transfers in case of emergency
 * - Permit: Supports gasless approvals (EIP-2612)
 * - Ownable: Contract has an owner who can pause/unpause
 * 
 * The contract uses OpenZeppelin's implementations for security and standards compliance.
 * This token is designed to be deployed on Base L2 (Ethereum Layer 2).
 */
contract TokenBotL2 is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, Ownable {
    // Total supply: 1 billion tokens with 18 decimals
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    /**
     * @dev Constructor that mints all tokens to the deployer
     * 
     * Upon deployment:
     * 1. Sets the token name to "TokenBot"
     * 2. Sets the token symbol to "TBOT"
     * 3. Mints the entire supply of 1,000,000,000 TBOT to the deployer's address
     * 4. Sets the deployer as the contract owner
     * 5. Initializes ERC20Permit with the token name for EIP-712
     */
    constructor() 
        ERC20("TokenBot", "TBOT") 
        ERC20Permit("TokenBot")
        Ownable(msg.sender)
    {
        // Mint the total supply to the contract deployer
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Pause all token transfers
     * 
     * Requirements:
     * - Only the contract owner can call this function
     * - Useful for emergency situations
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause all token transfers
     * 
     * Requirements:
     * - Only the contract owner can call this function
     * - Resumes normal token operations after a pause
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     * 
     * This function ensures that token transfers respect the pause state
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * This function is already implemented in OpenZeppelin's ERC20 contract
     * and returns 18 by default, which is the standard for ERC-20 tokens.
     */
    // decimals() returns 18 by default in OpenZeppelin's ERC20
}