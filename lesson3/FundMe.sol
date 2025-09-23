// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没达到目标值，投资人可以在锁定期后退款

contract FundMe {
    mapping(address => uint256) public fundersToAmount;

    uint256 constant MINIMUM_VALUE_100USD = 100 * 10**18; // 最小值 100USD

    AggregatorV3Interface internal dataFeed;

    uint256 constant TARGET = 1000 * 10**18;

    address public owner;

    uint256 deploymentTimestamp;

    uint256 lockTime;

    constructor(uint256 _lockTime) {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );

        owner = msg.sender;

        deploymentTimestamp = block.timestamp;

        lockTime = _lockTime;
    }

    function fund() external payable {
        require(
            convertEthToUsd(msg.value) >= MINIMUM_VALUE_100USD,
            "Send more ETH"
        ); // revert

        require(
            block.timestamp < deploymentTimestamp + lockTime,
            "Window is closed."
        );

        fundersToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();

        return answer;
    }

    function convertEthToUsd(uint256 _ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (_ethAmount * ethPrice) / (10**8);
        // 一个10 ** 18的数字_ethAmount 乘以 一个10 ** 8次方的数字ethPrice， 再除以一个 10 ** 8，结果是一个 10 ** 18的数字

        // 精度说明
        // ETH / USD precision = 10 ** 8
        // X / ETH precision =  10 ** 18
    }

    function trasferOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    function getFund() external windowClosed onlyOwner {
        require(
            convertEthToUsd(address(this).balance) >= TARGET,
            "Target is not reached."
        );

        // transfer (纯转账) : transfer ETH and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);

        // send (纯转账) :  transfer ETH and return false if tx failed
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed.");

        // call (转账时可带数据，可执行其他逻辑) : transfer ETH with data return value of function and bool
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );

        require(success, "tx failed.");

        fundersToAmount[msg.sender] = 0;
    }

    function refund() external windowClosed {
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is reached."
        );

        require(fundersToAmount[msg.sender] != 0, "There is no fund for you");

        bool success;
        (success, ) = payable(msg.sender).call{
            value: fundersToAmount[msg.sender]
        }("");

        require(success, "tx failed.");

        fundersToAmount[msg.sender] = 0;
    }

    modifier windowClosed() {
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "Window is not closed."
        );
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "This function can only be called by owner."
        );
        _;
    }
}
