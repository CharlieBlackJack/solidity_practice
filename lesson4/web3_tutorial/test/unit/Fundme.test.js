const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config");

!DEVELOPMENT_CHAINS.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let fundMeSecondAccount;
      let firstAccount;
      let secondAccount;
      let mockV3Aggregator;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        secondAccount = (await getNamedAccounts()).secondAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount);
        await fundMe.waitForDeployment();
      });

      it("test if the owner is msg.sender", async function () {
        assert.equal(await fundMe.owner(), firstAccount);
      });

      it("test if the dataFeed is assigned correctly", async function () {
        assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address);
      });

      // fund
      // 已知满足的条件是fund window内，金额大于minimum
      // 1. fund window外
      it("window closed, value is greater than minimum, fund failed", async function () {
        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();
        expect(
          fundMe.fund({ value: ethers.parseEther("0.05") })
        ).to.be.revertedWith("Window is closed.");
      });

      // 2. 金额小于minimum
      it("window open, value is less than minimum, fund failed", async function () {
        expect(
          fundMe.fund({ value: ethers.parseEther("0.01") })
        ).to.be.revertedWith("Send more ETH");
      });

      // 3.funder balance 有没有正确记录
      it("window open, value is greater than minimum, fund success", async function () {
        // greater than minimum
        await fundMe.fund({ value: ethers.parseEther("0.05") });
        const balance = await fundMe.fundersToAmount(firstAccount);
        expect(balance).to.equal(ethers.parseEther("0.05"));
      });

      // getFund
      // 已知满足的条件是 window 关闭, msg.sender 是 owner, 合约募集金额大于 Target
      // 1. msg.sender is not owner, window closed, target reached
      it("msg.sender is not owner, window closed, target reached, getFund failed", async function () {
        // target reached
        await fundMe.fund({ value: ethers.parseEther("0.26") });

        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();

        expect(fundMeSecondAccount.getFund()).to.be.revertedWith(
          "This function can only be called by owner."
        );
      });
      // 2. window is open, target reached
      it("window is open, target reached, getFund failed", async function () {
        //target reached
        await fundMe.fund({ value: ethers.parseEther("0.26") });

        expect(fundMe.getFund()).to.be.revertedWith("Window is not closed.");
      });

      // 3. 合约募集金额小于 target
      it("target is not reached, window is closed, getFund failed", async function () {
        //target is not reached
        await fundMe.fund({ value: ethers.parseEther("0.05") });

        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();
        expect(fundMe.getFund()).to.be.revertedWith("Target is not reached.");
      });

      // 4. window closed, target reached, msg.sender is owner, getFund success
      it("window closed, target reached, msg.sender is owner, getFund success", async function () {
        // target reached
        await fundMe.fund({ value: ethers.parseEther("0.13") });
        await fundMeSecondAccount.fund({ value: ethers.parseEther("0.12") });

        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();

        expect(fundMe.getFund())
          .to.emit(fundMe, "FundWithdrawnByOwner")
          .withArgs(ethers.parseEther("0.25"));
      });

      // refund
      // 1. window is open, target is not reached, funder has balance, refund failed
      it(" window is open, target is not reached, funder has balance, refund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.05") });
        expect(fundMe.getFund()).to.be.revertedWith("Window is not closed.");
      });

      // 2. target is reached, window is closed, funder has balance, refund failed
      it("target is reached, window is closed, funder has balance, refund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.26") });
        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();
        expect(fundMe.refund()).to.be.revertedWith("Target is reached.");
      });

      // 3. funder has no balance, window is closed, target is not reached, refund failed
      it("funder has no balance, window is closed, target is not reached, refund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.05") });
        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();
        expect(fundMeSecondAccount.refund()).to.be.revertedWith(
          "There is no fund for you"
        );
      });

      // 4. window is closed, target is not reached, funder has balance, refund success
      it("window is closed, target is not reached, funder has balance, refund success", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.05") });
        // make sure the time is after the lock time
        await helpers.time.increase(200);
        await helpers.mine();
        expect(fundMe.refund())
          .to.emit("RefundByFunder")
          .withArgs(firstAccount, ethers.parseEther("0.05"));
      });
    });
