// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 地址变了，下面这个链接无了
// import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AggregatorV2V3Interface} from "./interfaces/AggregatorV2V3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没达到目标值，投资人可以在锁定期后退款

contract FundMe {
    mapping(address => uint256) public fundersToAmount;

    uint256 constant MINIMUM_VALUE_100USD = 100 * 10 ** 18; // 最小值 100USD

    AggregatorV2V3Interface public dataFeed;

    uint256 constant TARGET = 1000 * 10 ** 18;

    address public owner;

    uint256 deploymentTimestamp;

    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    event FundWithdrawnByOwner(uint256);

    event RefundByFunder(address, uint256);

    constructor(uint256 _lockTime, address _dataFeedAddr) {
        dataFeed = AggregatorV2V3Interface(_dataFeedAddr);

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

    function convertEthToUsd(
        uint256 _ethAmount
    ) internal view returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (_ethAmount * ethPrice) / (10 ** 8);
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
        uint256 balance = address(this).balance;
        (success, ) = payable(msg.sender).call{value: balance}("");

        require(success, "tx failed.");

        fundersToAmount[msg.sender] = 0;

        getFundSuccess = true;

        // emit event
        emit FundWithdrawnByOwner(balance);
    }

    function refund() external windowClosed {
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is reached."
        );

        require(fundersToAmount[msg.sender] != 0, "There is no fund for you");

        bool success;
        uint256 balance = fundersToAmount[msg.sender];
        (success, ) = payable(msg.sender).call{value: balance}("");

        require(success, "tx failed.");

        fundersToAmount[msg.sender] = 0;

        emit RefundByFunder(msg.sender, balance);
    }

    function setFunderToAmount(
        address _funder,
        uint256 _amountToUpdate
    ) external {
        require(
            msg.sender == erc20Addr,
            "You do not have a permission to call this function."
        );

        fundersToAmount[_funder] = _amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
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
