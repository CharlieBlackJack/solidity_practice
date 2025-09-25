const { network } = require("hardhat");
const {
  DEVELOPMENT_CHAINS,
  NETWORK_CONFIG,
  LOCK_TIME,
  CONFIRMATIONS,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;
  let dataFeedAddr;
  let confirmations;

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    dataFeedAddr = mockV3Aggregator.address;
    confirmations = 0;
  } else {
    dataFeedAddr = NETWORK_CONFIG[network.config.chainId].ethUsdDataFeed;
    confirmations = CONFIRMATIONS;
  }

  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddr],
    log: true,
    waitConfirmations: confirmations,
  });

  // remove deployments directory or add --reset flag if you want to redeploy a contract
  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // verify contract
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, dataFeedAddr],
    });
  } else {
    console.log("Network is not Sepolia, verification skipped.");
  }
};

module.exports.tags = ["all", "fundme"];
