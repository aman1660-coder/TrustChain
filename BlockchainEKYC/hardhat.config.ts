import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// 🔥 ADD THESE (VERY IMPORTANT)
const INFURA_URL = "https://sepolia.infura.io/v3/6534b432816f4b4b9e3fb212ab7c6a53";
const PRIVATE_KEY = "5f5a0946d24c5e2ee066ee511b993b799d14f6c03fa07ca39408f04cb6b9c076";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    hardhat: {},

    localhost: {
      url: "http://127.0.0.1:8545"
    },

    // 🔥 ADD THIS BLOCK
    sepolia: {
      url: INFURA_URL,
      accounts: [PRIVATE_KEY]
    }
  },

  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  mocha: {
    timeout: 40000
  }
};

export default config;