// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title EcoScore — soulbound sustainability credit score (ERC-721, non-transferable)
contract EcoScore is ERC721, Ownable {
    struct Score {
        uint256 carbon;
        uint256 water;
        uint256 food;
        uint256 consumption;
        uint256 waste;
    }

    mapping(address => Score) public scores;
    mapping(address => bool) public hasToken;
    uint256 private _nextId = 1;

    address public minter;

    event ScoreUpdated(address indexed user, Score score);

    constructor() ERC721("EcoScore", "ECO") Ownable(msg.sender) {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    /// @notice Mint a soulbound token to a user (once).
    function mint(address to) external {
        require(msg.sender == minter, "not minter");
        require(!hasToken[to], "already minted");
        hasToken[to] = true;
        _safeMint(to, _nextId++);
    }

    /// @notice Update the holistic score for a user.
    function updateScore(address user, Score calldata s) external {
        require(msg.sender == minter, "not minter");
        require(hasToken[user], "no token");
        scores[user] = s;
        emit ScoreUpdated(user, s);
    }

    /// @dev Soulbound: block all transfers.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("soulbound: non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
