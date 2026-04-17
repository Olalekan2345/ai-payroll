require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config(); // fallback to .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    "0g-galileo": {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    hardhat: { chainId: 31337 },
  },
};
