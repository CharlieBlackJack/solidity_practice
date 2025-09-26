const { task } = require("hardhat/config");

task("check-wnft", "Check WNFT ownership").setAction(async (taskArgs, hre) => {
  const namedAccounts = await getNamedAccounts();
  const firstAccount = namedAccounts.firstAccount;
  const wnft = await ethers.getContract("WrappedMyToken", firstAccount);
  const totalSupply = await wnft.totalSupply();
  console.log("Checking status of WrappedMyToken");

  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    const owner = await wnft.ownerOf(tokenId);
    console.log(`TokenID: ${tokenId} is owned by ${owner}`);
  }
});

module.exports = {};
