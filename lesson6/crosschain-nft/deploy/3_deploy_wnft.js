module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Deploying WNFT contract...");
  await deploy("WrappedMyToken", {
    contract: "WrappedMyToken",
    from: firstAccount,
    log: true,
    args: ["WrappedMyToken", "WMT"],
  });
  log("WNFT contract has been deployed successfully.");
};

module.exports.tags = ["all", "destchain"];
