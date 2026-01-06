import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployAllModule = buildModule("DeployAllModule", (m) => {
  // Deploy MarketPlaceNFT (ERC721 Collection)
  // Collection: "7ONG COLLECTION" (7ONG)
  const nftContract = m.contract("MarketPlaceNFT");
  
  // Deploy NFTMarketplace dengan fee 2%
  const feePercent = m.getParameter("feePercent", 2);
  const marketplace = m.contract("NFTMarketplace", [feePercent]);
  
  return { 
    nftContract,
    marketplace 
  };
});

export default DeployAllModule;
