const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");

let firstAccount,
  ccipLocalSimulator,
  nft,
  nftPoolLockAndRelease,
  wnft,
  nftPoolBurnAndMint,
  chainSelector;

before(async function () {
  const namedAccounts = await getNamedAccounts();
  firstAccount = namedAccounts.firstAccount;

  await deployments.fixture(["all"]);

  ccipLocalSimulator = await ethers.getContract(
    "CCIPLocalSimulator",
    firstAccount
  );
  nft = await ethers.getContract("MyToken", firstAccount);

  nftPoolLockAndRelease = await ethers.getContract(
    "NFTPoolLockAndRelease",
    firstAccount
  );

  wnft = await ethers.getContract("WrappedMyToken", firstAccount);

  nftPoolBurnAndMint = await ethers.getContract(
    "NFTPoolBurnAndMint",
    firstAccount
  );

  const config = await ccipLocalSimulator.configuration();
  chainSelector = config.chainSelector_;
});

// source chain -> destination chain
describe("source chain -> destination chain tests", async function () {
  it("test if user can mint a nft from nft contract successfully", async function () {
    await nft.safeMint(firstAccount);
    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });

  it("test if user can lock the nft in the pool and seed ccip message on source chain", async function () {
    await nft.approve(nftPoolLockAndRelease.target, 0);
    await ccipLocalSimulator.requestLinkFromFaucet(
      nftPoolLockAndRelease,
      ethers.parseEther("10")
    );
    await nftPoolLockAndRelease.lockAndSendNFT(
      0,
      firstAccount,
      chainSelector,
      nftPoolBurnAndMint.target
    );

    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(nftPoolLockAndRelease);
  });

  it("test if user can get a wrapped nft on destination chain", async function () {
    const owner = await wnft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });
});

// detination chain -> source chain
describe("detination chain -> source chain", async function () {
  it("test if user can burn the wnft and send ccip message on destination chain", async function () {
    await wnft.approve(nftPoolBurnAndMint.target, 0);
    await ccipLocalSimulator.requestLinkFromFaucet(
      nftPoolBurnAndMint,
      ethers.parseEther("10")
    );
    await nftPoolBurnAndMint.burnAndSendNFT(
      0,
      firstAccount,
      chainSelector,
      nftPoolLockAndRelease.target
    );
    const totalSupply = await wnft.totalSupply();
    expect(totalSupply).to.equal(0);
  });

  it("test if user have the unlocked nft on source chain", async function () {
    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });
});
