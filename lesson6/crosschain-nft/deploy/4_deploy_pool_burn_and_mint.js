const {
  DEVELOPMENT_CHAINS,
  NETWORK_CONFIG,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Deploying NFTPoolBurnAndMint contract...");

  let destinationChainRouter, linkTokenAddr;

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const ccipLocalSimulatorDeployment = await deployments.get(
      "CCIPLocalSimulator"
    );
    const ccipLocalSimulator = await ethers.getContractAt(
      "CCIPLocalSimulator",
      ccipLocalSimulatorDeployment.address
    );
    const ccipConfig = await ccipLocalSimulator.configuration();
    destinationChainRouter = ccipConfig.destinationRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    destinationChainRouter = NETWORK_CONFIG[network.config.chainId].router;
    linkTokenAddr = NETWORK_CONFIG[network.config.chainId].linkToken;
  }

  const wnftDeployment = await deployments.get("WrappedMyToken");
  const wnftAddr = wnftDeployment.address;

  await deploy("NFTPoolBurnAndMint", {
    contract: "NFTPoolBurnAndMint",
    from: firstAccount,
    log: true,
    args: [destinationChainRouter, linkTokenAddr, wnftAddr],
  });

  log("NFTPoolBurnAndMint contract has been deployed successfully.");
};

module.exports.tags = ["all", "destchain"];
