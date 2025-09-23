// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Parent {
    uint256 public a;
    uint256 private b = 10;

    function addOne() public {
        a++;
    }
}

abstract contract Parent2 is Parent {
    function addThree() public virtual;

    function addAmount(uint256 _amount) public virtual {
        a += _amount;
    }
}

contract Child is Parent, Parent2 {
    function addTwo() public {
        a += 2;
    }

    function addThree() public override {
        a += 3;
    }

    function addAmount(uint256 _amount) public override {
        a += _amount * 2;
    }
}

// ERC20: Fungible Token
// ERC721: NFT - Non-Fungible Token
