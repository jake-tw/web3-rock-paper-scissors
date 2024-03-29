// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IRockPaperScissorsEvents.sol";
import "./interfaces/IRockPaperScissorsStructs.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract RockPaperScissors is
    Ownable,
    IRockPaperScissorsEvents,
    IRockPaperScissorsStructs
{
    using Counters for Counters.Counter;

    // game id => game info
    mapping(uint => GameInfo) public games;
    // game id => idx
    mapping(uint => uint) public gameIdx;
    uint[] public allGames;

    Counters.Counter public idCounter;
    address public judge;
    address public token;

    constructor(address _token, address _judge) {
        judge = _judge;
        token = _token;
    }

    modifier isJudge() {
        require(judge == msg.sender, "Is not the judge.");
        _;
    }

    modifier notJudge() {
        require(judge != msg.sender, "Is the judge.");
        _;
    }

    modifier notBanker(uint id) {
        address banker = games[id].banker;
        require(banker != msg.sender, "Is the banker.");
        _;
    }

    modifier gameExists(uint id) {
        address banker = games[id].banker;
        require(banker != address(0), "Game not exists.");
        _;
    }

    function setJudge(address _judge) public onlyOwner {
        judge = _judge;
    }

    function getId(uint idx) public view returns (uint) {
        return allGames[idx];
    }

    function allGameLength() public view returns (uint) {
        return allGames.length;
    }

    function newGame(bytes32 throwHash, uint stakes) public notJudge {
        address banker = msg.sender;

        uint approval = ERC20(token).allowance(banker, address(this));
        require(approval >= stakes, "Not enough approval.");

        ERC20(token).transferFrom(banker, address(this), stakes);

        idCounter.increment();
        uint id = idCounter.current();

        games[id] = GameInfo(banker, address(0), throwHash, "", stakes);
        gameIdx[id] = allGameLength();
        allGames.push(id);

        emit GameSetup(banker, throwHash, stakes, id);
    }

    function matchGame(
        bytes32 throwHash,
        uint id
    ) public gameExists(id) notBanker(id) notJudge {
        address player = msg.sender;
        GameInfo storage gameInfo = games[id];

        uint approval = ERC20(token).allowance(player, address(this));
        uint _stakges = gameInfo.stakes;
        require(approval >= _stakges, "Not enough approval.");

        ERC20(token).transferFrom(player, address(this), _stakges);

        gameInfo.player = player;
        gameInfo.playerThrowHash = throwHash;

        emit GameMatched(player, throwHash, id);
    }

    function showdown(
        uint id,
        uint bankerSalt,
        uint playerSalt
    ) public isJudge {
        GameInfo storage gameInfo = games[id];
        address banker = gameInfo.banker;
        address player = gameInfo.player;

        ThrowType bankerThrowType = verifyThrowHash(
            gameInfo.bankerThrowHash,
            banker,
            bankerSalt
        );

        ThrowType playerThrowType = verifyThrowHash(
            gameInfo.playerThrowHash,
            player,
            playerSalt
        );

        WinnerType winnerType = duel(bankerThrowType, playerThrowType);
        address winner;
        if (winnerType == WinnerType.NONE) {
            refund(banker, player, gameInfo.stakes);
        } else {
            winner = winnerType == WinnerType.BANKER ? banker : player;
            tranferPrize(winner, gameInfo.stakes);
        }
        dropGame(id);

        emit GameResult(winner, bankerSalt, playerSalt, id);
    }

    function encodeThrowHash(
        ThrowType throwType,
        uint salt
    ) public view returns (bytes32) {
        address sender = msg.sender;
        return encodeThrowHash(sender, throwType, salt);
    }

    function encodeThrowHash(
        address sender,
        ThrowType throwType,
        uint salt
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(sender, throwType, salt));
    }

    function verifyThrowHash(
        bytes32 throwHash,
        address sender,
        uint salt
    ) public pure returns (ThrowType result) {
        if (throwHash == encodeThrowHash(sender, ThrowType.ROCK, salt)) {
            result = ThrowType.ROCK;
        } else if (
            throwHash == encodeThrowHash(sender, ThrowType.PAPER, salt)
        ) {
            result = ThrowType.PAPER;
        } else if (
            throwHash == encodeThrowHash(sender, ThrowType.SCISSOR, salt)
        ) {
            result = ThrowType.SCISSOR;
        } else {
            require(
                false,
                string(abi.encodePacked("Throw type error: ", sender))
            );
        }
    }

    function refund(address banker, address player, uint stake) internal {
        ERC20(token).transfer(banker, stake);
        ERC20(token).transfer(player, stake);
    }

    function tranferPrize(
        address winner,
        uint stake
    ) internal returns (uint fee) {
        fee = (stake * 3) / 1000;
        ERC20(token).transfer(owner(), fee);
        ERC20(token).transfer(winner, stake * 2 - fee);
    }

    function dropGame(uint id) internal {
        uint idx = gameIdx[id];
        uint latestIdx = allGameLength() - 1;

        uint latestId = allGames[latestIdx];
        allGames[idx] = latestId;
        gameIdx[latestId] = idx;

        allGames.pop();
        delete gameIdx[id];
        delete games[id];
    }

    function duel(
        ThrowType bankerThrowType,
        ThrowType playerThrowType
    ) public pure returns (WinnerType) {
        uint8 a = uint8(bankerThrowType);
        uint8 b = uint8(playerThrowType);
        if (a == b) {
            return WinnerType.NONE;
        }

        if (a == 0) {
            return b == 2 ? WinnerType.BANKER : WinnerType.PLAYER;
        }

        if (a == 1) {
            return b == 0 ? WinnerType.BANKER : WinnerType.PLAYER;
        }

        if (a == 2) {
            return b == 1 ? WinnerType.BANKER : WinnerType.PLAYER;
        }

        return WinnerType.NONE;
    }
}
