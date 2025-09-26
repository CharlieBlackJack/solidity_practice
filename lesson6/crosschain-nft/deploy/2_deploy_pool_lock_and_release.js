const {
  DEVELOPMENT_CHAINS,
  NETWORK_CONFIG,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Deploying NFTPoolLockAndRelease contract...");

  let sourceChainRouter, linkTokenAddr;

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const ccipLocalSimulatorDeployment = await deployments.get(
      "CCIPLocalSimulator"
    );
    const ccipLocalSimulator = await ethers.getContractAt(
      "CCIPLocalSimulator",
      ccipLocalSimulatorDeployment.address
    );
    const ccipConfig = await ccipLocalSimulator.configuration();
    sourceChainRouter = ccipConfig.sourceRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    sourceChainRouter = NETWORK_CONFIG[network.config.chainId].router;
    linkTokenAddr = NETWORK_CONFIG[network.config.chainId].linkToken;
  }

  const nftDeploytment = await deployments.get("MyToken");
  const nftAddr = nftDeploytment.address;

  await deploy("NFTPoolLockAndRelease", {
    contract: "NFTPoolLockAndRelease",
    from: firstAccount,
    log: true,
    args: [sourceChainRouter, linkTokenAddr, nftAddr],
  });

  log("NFTPoolLockAndRelease contract has been deployed successfully.");
};

module.exports.tags = ["all", "sourcechain"];
