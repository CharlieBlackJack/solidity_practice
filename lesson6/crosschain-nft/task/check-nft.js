const { task } = require("hardhat/config");

task("check-nft", "Check NFT ownership").setAction(async (taskArgs, hre) => {
  const namedAccounts = await getNamedAccounts();
  const firstAccount = namedAccounts.firstAccount;
  const nft = await ethers.getContract("MyToken", firstAccount);
  const totalSupply = await nft.totalSupply();
  console.log("Checking status of MyToken");

  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    const owner = await nft.ownerOf(tokenId);
    console.log(`TokenID: ${tokenId} is owned by ${owner}`);
  }
});

module.exports = {};
