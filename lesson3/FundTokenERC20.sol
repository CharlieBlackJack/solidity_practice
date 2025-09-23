// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// FundMe
// 1. 让FundMe的参与者, 基于 mapping 来领取相应的通证
// 2. 让FundMe的参与者, transfer 通证
// 3. 在使用完成以后 burn 通证

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from "./FundMe.sol";

contract FundTokenERC20 is ERC20 {
    FundMe fundMe;
    constructor(address fundMeAddr) ERC20("FundTokenERC20", "FT") {
        fundMe = FundMe(fundMeAddr);
    }

    function mint(uint256 amountToMint) public completedFundMe {
        require(
            fundMe.fundersToAmount(msg.sender) >= amountToMint,
            "You can't mint tokens more than your funded amount."
        );

        _mint(msg.sender, amountToMint);

        fundMe.setFunderToAmount(
            msg.sender,
            fundMe.fundersToAmount(msg.sender) - amountToMint
        );
    }

    function claim(uint amountToClaim) public completedFundMe {
        // complete claim
        require(
            balanceOf(msg.sender) >= amountToClaim,
            "You don't have enough ERC20 Tokens."
        );

        /* to add */

        // burn amountToClaim tokens
        _burn(msg.sender, amountToClaim);
    }

    modifier completedFundMe() {
        require(fundMe.getFundSuccess(), "The FundMe is no completed yet.");
        _;
    }
}
