// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockEscrow — releases funds with 70/15/15 split on credit retirement
contract MockEscrow is Ownable {
    address public treasury;
    address public nodeOperator;

    event Released(address indexed user, uint256 userAmt, uint256 nodeAmt, uint256 treasuryAmt);

    constructor(address _treasury, address _nodeOperator) Ownable(msg.sender) {
        treasury = _treasury;
        nodeOperator = _nodeOperator;
    }

    /// @notice Release `amount` to user (70%), node (15%), treasury (15%).
    function release(address user, uint256 amount) external onlyOwner {
        uint256 userAmt = (amount * 70) / 100;
        uint256 nodeAmt = (amount * 15) / 100;
        uint256 treasuryAmt = amount - userAmt - nodeAmt;
        (bool ok1, ) = user.call{value: userAmt}("");
        (bool ok2, ) = nodeOperator.call{value: nodeAmt}("");
        (bool ok3, ) = treasury.call{value: treasuryAmt}("");
        require(ok1 && ok2 && ok3, "transfer failed");
        emit Released(user, userAmt, nodeAmt, treasuryAmt);
    }

    receive() external payable {}
}
