const { task } = require("hardhat/config");
const { NETWORK_CONFIG } = require("../helper-hardhat-config");

task("burn-and-cross", "Burn and cross.")
  .addOptionalParam("chainSelector", "chain selector of destination chain")
  .addOptionalParam("receiver", "receiver address on destination chain")
  .addParam("tokenid", "token ID to be crossed chain")
  .setAction(async (taskArgs, hre) => {
    let chainSelector;
    let receiver;
    const tokenId = taskArgs.tokenid;
    const namedAccounts = await getNamedAccounts();
    const firstAccount = namedAccounts.firstAccount;

    if (taskArgs.chainSelector) {
      chainSelector = taskArgs.chainSelector;
    } else {
      chainSelector =
        NETWORK_CONFIG[network.config.chainId].companionChainSelector;
      console.log("chainSelector is not set in command.");
    }
    console.log(`chainSelector is ${chainSelector}`);

    if (taskArgs.receiver) {
      receiver = taskArgs.receiver;
    } else {
      const ntfPoolLockAndReleaseDeployment = await hre.companionNetworks[
        "destinationChain"
      ].deployments.get("NFTPoolLockAndRelease");
      receiver = ntfPoolLockAndReleaseDeployment.address;
      console.log("receiver is not set in command.");
    }
    console.log(`receiver's address is ${receiver}`);

    // transfer link token to address of the poll
    const linkTokenAddress = NETWORK_CONFIG[network.config.chainId].linkToken;
    const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);
    const nftPoolBurnAndMint = await ethers.getContract(
      "NFTPoolBurnAndMint",
      firstAccount
    );

    const transferTx = await linkToken.transfer(
      nftPoolBurnAndMint.target,
      ethers.parseEther("10")
    );
    await transferTx.wait(6);
    const balance = await linkToken.balanceOf(nftPoolBurnAndMint.target);
    console.log(`balance of the pool is ${balance}`);

    // approve pool address to call transferFrom
    const wnft = await ethers.getContract("WrappedMyToken", firstAccount);
    await wnft.approve(nftPoolBurnAndMint.target, tokenId);
    console.log(`approve successfully.`);

    // call burnAndSendNFT
    const burnAndSendNFTTx = await nftPoolBurnAndMint.burnAndSendNFT(
      tokenId,
      firstAccount,
      chainSelector,
      receiver
    );
    console.log(
      `ccip transaction is sent, burnAndSendNFT tx hash is ${burnAndSendNFTTx.hash}`
    );
  });

module.exports = {};
