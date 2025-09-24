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
  const fundMe = await fundMeFactory.deploy(10);
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
    await fundMe.deployTransaction().wait(5);
    // verify contract
    await verifyFundMe(fundMe.target, [10]);
  } else {
    console.log("Verification skipped.");
  }
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    // 正常退出使用 0, 异常退出使用 1
    process.exit(1);
  });
