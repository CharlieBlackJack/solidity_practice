const { network } = require("hardhat");
const { DEVELOPMENT_CHAINS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const { firstAccount } = await getNamedAccounts();
    const { deploy, log } = deployments;

    log("Deploying CCIP Local Simulator contract...");
    await deploy("CCIPLocalSimulator", {
      contract: "CCIPLocalSimulator",
      from: firstAccount,
      log: true,
      args: [],
    });
    log("CCIP Local Simulator contract has been deployed successfully.");
  }
};

module.exports.tags = ["all", "test"];
