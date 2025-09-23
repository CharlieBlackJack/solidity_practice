// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 1. 引入文件系统下的合约
// import "./hello.sol"; // 引入了该文件的全部合约
// import {HelloWorld} from "./hello.sol"; // 按需引入

// 2. 从网络上引入某个合约
// import {HelloWorld} from "https://github.com/smartcontractkit/Web3_tutorial_Chinese/blob/main/lesson-2/HelloWorld.sol";

// 3. 通过包引入
// import {xxxContract} from "@companyName/product/contract";

import {HelloWorld} from "./hello.sol";

contract HelloWorldFactory {
    HelloWorld hw;

    HelloWorld[] hws;

    function createHelloWorld() public {
        hw = new HelloWorld();
        hws.push(hw);
    }

    function getHelloWorldByIndex(uint256 _index)
        public
        view
        returns (HelloWorld)
    {
        return hws[_index];
    }

    function callSayHelloFromFactory(uint256 _index, uint256 _id)
        public
        view
        returns (string memory)
    {
        return hws[_index].sayHello(_id);
    }

    function callSetHelloWorldFromFactory(
        uint256 _index,
        string memory _newString,
        uint256 _id
    ) public {
        hws[_index].setHelloWorld(_newString, _id);
    }
}
