const { task } = require("hardhat/config");

async function verifyFundMe(address, arguments) {
  // verify contract
  await hre.run("verify:verify", {
    address,
    constructorArguments: [...arguments],
  });
}

task(
  "deploy-fundme",
  "Deploy contract and verify it on sepolia by one step."
).setAction(async (taskArgs, hre) => {
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
});

module.exports = {};
