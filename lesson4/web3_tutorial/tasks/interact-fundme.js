const { task } = require("hardhat/config");

task("interact-fundme", "Interact with the FundMe contract.")
  .addParam("addr", "fundme contract address")
  .setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(taskArgs.addr);
    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();
    // fund contract with first account
    const fundTx = await fundMe.fund({
      value: ethers.parseEther("0.2"),
    });
    await fundTx.wait();
    // check contract balance
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(
      `Contract balance is: ${ethers.formatEther(balanceOfContract)} ETH`
    );

    // fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({
      value: ethers.parseEther("0.2"),
    });
    await fundTxWithSecondAccount.wait();
    // check contract balance again
    const balanceOFContractAfterSecondFund = await ethers.provider.getBalance(
      fundMe.target
    );
    console.log(
      `Contract balance is: ${ethers.formatEther(
        balanceOFContractAfterSecondFund
      )} ETH`
    );
    // check mapping fundersToAmount
    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(
      firstAccount.address
    );

    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(
      secondAccount.address
    );

    console.log(
      `Balance of first account ${firstAccount.address} is ${firstAccountBalanceInFundMe}`
    );
    console.log(
      `Balance of second account ${secondAccount.address} is ${secondAccountBalanceInFundMe}`
    );
  });

module.exports = {};
