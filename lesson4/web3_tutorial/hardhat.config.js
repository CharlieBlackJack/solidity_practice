require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("./tasks");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const sourcifyEnabled = () => {
  // 首先，朕用的VPN代理是TUN模式的全局代理，因为某些懒得喷的原因必须用这个
  // 当我运行 npx hardhat test --network sepolia时，出现了如下报错：
  // NetworkRequestError: A network request failed.
  // This is an error from the block explorer, not Hardhat. Error: other side closed

  // 经过观察我发现第一次的合约部署和验证成功了，但是第二次用于集测的合约根本没部署
  // 根据错误信息分析，问题可能出现在 deployments.fixture(["all"]) 执行时，它会重新运行部署脚本 01-deploy-fund-me.js
  // 而该脚本中的验证步骤（Sourcify）因为 VPN 可能影响到 Sourcify API 的连接而失败
  // 最终我通过关闭 Sourcify 验证解决这个问题

  const args = process.argv;
  const shouldDisableForProxy =
    args.includes("--network") &&
    (args.includes("sepolia") || args.includes("mainnet"));
  return !shouldDisableForProxy;
};

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      // url: 提供商Alchemy、Infura、QuickNode
      url: SEPOLIA_URL,
      // 私钥
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: sourcifyEnabled(),
  },
  namedAccounts: {
    firstAccount: {
      default: 0,
    },
    secondAccount: {
      default: 1,
    },
  },
  mocha: {
    timeout: 300000,
  },
  gasReporter: {
    enabled: true,
  },
};
