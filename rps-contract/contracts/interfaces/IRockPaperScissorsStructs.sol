// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IRockPaperScissorsStructs {
    enum ThrowType {
        ROCK,
        PAPER,
        SCISSOR
    }
    enum WinnerType {
        BANKER,
        PLAYER,
        NONE
    }
    struct GameInfo {
        address banker;
        address player;
        bytes32 bankerThrowHash;
        bytes32 playerThrowHash;
        uint stakes;
    }
}
