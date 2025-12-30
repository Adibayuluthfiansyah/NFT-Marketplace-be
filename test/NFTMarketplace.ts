import { expect } from "chai";
import { viem } from "hardhat";
import { parseEther, getAddress } from "viem";

describe("NFTMarketplace", function () {
  async function deployFixture() {
    const [owner, seller, buyer] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();
    const marketplace = await viem.deployContract("NFTMarketplace", [2n]);
    const testNft = await viem.deployContract("TestNFT");

    return { marketplace, testNft, owner, seller, buyer, publicClient };
  }

  describe("Transactions", function () {
    it("Should execute full trade cycle (List -> Buy -> Withdraw)", async function () {
      const { marketplace, testNft, owner, seller, buyer, publicClient } = await deployFixture();
      
      const PRICE = parseEther("10");
      const TOKEN_ID = 1n;
      const FEE_PERCENT = 2n;

      // Seller minting NFT ID 
      await testNft.write.mint([seller.account.address, TOKEN_ID]);
      
      // Seller approve Marketplace for handle NFT
      await testNft.write.setApprovalForAll([marketplace.address, true], {
        account: seller.account
      });

      // Seller sold NFT to Marketplace 10ETH
      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
        account: seller.account
      });

      // NFT to marketplace 
      expect(await testNft.read.ownerOf([TOKEN_ID])).to.equal(getAddress(marketplace.address));


      // Buyer bought NFT
      await marketplace.write.buyItem([testNft.address, TOKEN_ID], {
        account: buyer.account,
        value: PRICE
      });

      // check ownership change to Buyer
      expect(await testNft.read.ownerOf([TOKEN_ID])).to.equal(getAddress(buyer.account.address));


      // Count fee : 2% of 10 ETH = 0.2 ETH
      const feeAmount = (PRICE * FEE_PERCENT) / 100n;
      const sellerAmount = PRICE - feeAmount;

      // Cek saldo virtual Seller di contract
      const sellerBalance = await marketplace.read.proceeds([seller.account.address]);
      expect(sellerBalance).to.equal(sellerAmount);

      // Cek saldo virtual Owner (Kamu) di contract
      const ownerBalance = await marketplace.read.proceeds([owner.account.address]);
      expect(ownerBalance).to.equal(feeAmount);

        // Seller withdraw proceeds
      // check balance before withdraw
      const balanceBefore = await publicClient.getBalance({ address: seller.account.address });
      
      const tx = await marketplace.write.withdrawProceeds({
        account: seller.account
      });

      // ignore gas fee for simplicity
      const balanceAfter = await publicClient.getBalance({ address: seller.account.address });
      expect(balanceAfter > balanceBefore).to.be.true;
      console.log("Full Cycle Trade Success");
    });
  });
});