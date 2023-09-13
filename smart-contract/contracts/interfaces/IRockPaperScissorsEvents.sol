// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IRockPaperScissorsEvents {
    event FeeUpdated(address indexed sender, uint from, uint to);
    event JudgeUpdated(address indexed sender, address from, address to);
    event GameSetup(
        address indexed banker,
        bytes32 bankerThrowHash,
        uint stakes,
        uint indexed id
    );
    event GameMatched(
        address indexed player,
        bytes32 playerThrowHash,
        uint indexed id
    );
    event GameResult(
        address indexed winer,
        uint bankerSeed,
        uint playerSeed,
        uint indexed id
    );
}
