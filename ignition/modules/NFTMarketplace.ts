import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const NFTMarketplaceModule = buildModule("NFTMarketplaceModule", (m) => {
    const feePercent = m.getParameter("feePercent", 2);
    const marketplace = m.contract("NFTMarketplace", [feePercent]);
    return {marketplace};

});

export default NFTMarketplaceModule;