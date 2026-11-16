// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title NullifierRegistry — prevents double-counting of credits
contract NullifierRegistry {
    mapping(bytes32 => bool) public used;

    event NullifierUsed(bytes32 indexed nullifier);

    function use(bytes32 nullifier) external returns (bool) {
        require(!used[nullifier], "nullifier already used");
        used[nullifier] = true;
        emit NullifierUsed(nullifier);
        return true;
    }

    function isUsed(bytes32 nullifier) external view returns (bool) {
        return used[nullifier];
    }
}
