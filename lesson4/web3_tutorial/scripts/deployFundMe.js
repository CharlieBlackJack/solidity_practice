// import ethers.js
// create main function
// execute main function

const { ethers } = require("hardhat");

async function verifyFundMe(address, arguments) {
  // verify contract
  await hre.run("verify:verify", {
    address,
    constructorArguments: [...arguments],
  });
}

async function main() {
  // create factory
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  console.log("Contract is deploying...");

  // deploy contract from factory
  const fundMe = await fundMeFactory.deploy(300);
  // wait for deployment to finish
  await fundMe.waitForDeployment();
  console.log(
    `Contract has been deployed successfully, contract address is ${fundMe.target}`
  );

  // if deploy to sepolia network, verify contract
  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // wait for 5 block confirmations
    console.log("Waiting  for 5 blocks confirmations...");
    await fundMe.deploymentTransaction().wait(5);
    // verify contract
    await verifyFundMe(fundMe.target, [300]);
  } else {
    console.log("Verification skipped.");
  }

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
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    // 正常退出使用 0, 异常退出使用 1
    process.exit(1);
  });
