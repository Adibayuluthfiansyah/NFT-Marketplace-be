import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

// Validate private key 
const getValidPrivateKey = (): string[] => {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    return [];
  }
  
  // Remove 0x prefix if exists
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // Validate length 
  if (cleanKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanKey)) {
    return [`0x${cleanKey}`];
  }
  
  return [];
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local Hardhat Network (
    hardhat: {
      chainId: 31337,
    },
    // Local Network untuk testing
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Sepolia Testnet (
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: getValidPrivateKey(),
      chainId: 11155111,
    },
  },
  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
