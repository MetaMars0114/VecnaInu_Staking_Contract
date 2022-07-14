// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(string memory _symbol, string memory _name)
        ERC20(_symbol, _name)
    {}

    function mint(uint256 _amount) external {
        _mint(msg.sender, _amount);
    }
}
