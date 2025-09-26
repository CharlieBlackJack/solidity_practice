module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Deploying NFT contract...");
  await deploy("MyToken", {
    contract: "MyToken",
    from: firstAccount,
    log: true,
    args: ["MyToken", "MT"],
  });
  log("NFT contract has been deployed successfully.");
};

module.exports.tags = ["all", "sourcechain"];
