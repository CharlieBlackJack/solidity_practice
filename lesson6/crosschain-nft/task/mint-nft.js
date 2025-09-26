const { task } = require("hardhat/config");

task("mint-nft", "Mint a new NFT").setAction(async (taskArgs, hre) => {
  const namedAccounts = await getNamedAccounts();
  const firstAccount = namedAccounts.firstAccount;
  const nft = await ethers.getContract("MyToken", firstAccount);
  console.log("Minting a  NFT from contract:");

  const mintTx = await nft.safeMint(firstAccount);
  mintTx.wait(6);
  console.log("NFT Minted!");
});

module.exports = {};
