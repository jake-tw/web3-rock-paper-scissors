// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    uint public immutable ONE_UNIT = 500000 * 10 ** decimals();

    constructor() ERC20("MockToken", "MTK") {
        faucet();
    }

    function faucet() public {
        _mint(msg.sender, ONE_UNIT);
    }
}
