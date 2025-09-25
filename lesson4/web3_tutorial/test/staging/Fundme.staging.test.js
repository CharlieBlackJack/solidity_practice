const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config");

DEVELOPMENT_CHAINS.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let firstAccount;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        // await fundMe.waitForDeployment();
      });

      // test fund and getFund successfully
      it("test fund and getFund successfully", async function () {
        // fund enough for target
        await fundMe.fund({ value: ethers.parseEther("0.26") });
        // window closed
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000));
        // make sure we can get receipt
        const getFundTx = await fundMe.getFund();
        const getFundReceipt = await getFundTx.wait();

        expect(getFundReceipt)
          .to.be.emit(fundMe, "FundWithdrawnByOwner")
          .withArgs(ethers.parseEther("0.26"));
      });

      // test fund and refund successfully
      it("test fund and refund successfully", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.05") });
        // window closed
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000));
        // make sure we can get receipt
        const refundTx = await fundMe.refund();
        const refundReceipt = await refundTx.wait();

        expect(refundReceipt)
          .to.be.emit(fundMe, "RefundByFunder")
          .withArgs(firstAccount, ethers.parseEther("0.05"));
      });
    });
