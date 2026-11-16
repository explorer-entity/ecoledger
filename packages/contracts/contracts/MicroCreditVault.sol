// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NullifierRegistry.sol";

/// @title MicroCreditVault — fractional green micro-credits (ERC-1155), pooled per user
contract MicroCreditVault is ERC1155, Ownable {
    uint256 public constant CREDIT_ID = 1;

    NullifierRegistry public immutable nullifiers;
    address public minter;

    event CreditMinted(address indexed to, uint256 amount, bytes32 indexed nullifier);
    event CreditRetired(address indexed from, uint256 amount);

    constructor(address nullifierRegistry) ERC1155("") Ownable(msg.sender) {
        nullifiers = NullifierRegistry(nullifierRegistry);
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    /// @notice Mint fractional credits for a verified action; nullifier prevents replay.
    function mintCredit(address to, uint256 amount, bytes32 nullifier) external {
        require(msg.sender == minter, "not minter");
        require(to != address(0), "zero recipient");
        require(amount > 0, "zero amount");
        nullifiers.use(nullifier); // reverts if already used
        _mint(to, CREDIT_ID, amount, "");
        emit CreditMinted(to, amount, nullifier);
    }

    /// @notice Burn credits on B2B retirement.
    function retire(address from, uint256 amount) external {
        require(msg.sender == minter || msg.sender == from, "not authorized");
        require(amount > 0, "zero amount");
        _burn(from, CREDIT_ID, amount);
        emit CreditRetired(from, amount);
    }

    function balance(address account) external view returns (uint256) {
        return balanceOf(account, CREDIT_ID);
    }
}
