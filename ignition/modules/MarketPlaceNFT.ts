import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MarketPlaceNFTModule = buildModule("MarketPlaceNFTModule", (m) => {
  // Deploy MarketPlaceNFT contract
  // Collection Name: "7ONG COLLECTION"
  // Symbol: "7ONG"
  const nftContract = m.contract("MarketPlaceNFT");
  
  return { nftContract };
});

export default MarketPlaceNFTModule;
