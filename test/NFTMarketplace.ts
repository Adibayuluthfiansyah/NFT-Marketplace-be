import { expect } from "chai";
import { viem } from "hardhat";
import { parseEther, getAddress } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("NFTMarketplace", function () {
  
  // --- SETUP FIXTURE  ---
  async function deployFixture() {
    // Get Wallets
    const [owner, seller, buyer, otherUser] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    // Deploy Contracts Fee awal: 2%
    const marketplace = await viem.deployContract("NFTMarketplace", [2n]);
    const testNft = await viem.deployContract("TestNFT");

    //  Mint NFT untuk Seller & Approve Marketplace
    const TOKEN_ID = 1n;
    await testNft.write.mint([seller.account.address, TOKEN_ID]);
    await testNft.write.setApprovalForAll([marketplace.address, true], {
      account: seller.account
    });

    return { 
      marketplace, 
      testNft, 
      owner, 
      seller, 
      buyer, 
      otherUser, 
      publicClient, 
      TOKEN_ID 
    };
  }

  // --- DEPLOYMENT CHECKS ---
  describe("Deployment", function () {
    it("Should set the correct initial fee", async function () {
      const { marketplace } = await loadFixture(deployFixture);
      const fee = await marketplace.read.feePercent();
      expect(fee).to.equal(2n);
    });

    it("Should set the correct owner", async function () {
      const { marketplace, owner } = await loadFixture(deployFixture);
      const contractOwner = await marketplace.read.owner();
      expect(contractOwner.toLowerCase()).to.equal(owner.account.address.toLowerCase());
    });
  });

  // --- LISTING LOGIC ---
  describe("Listing Logic", function () {
    it("Should allow seller to list an item", async function () {
      const { marketplace, testNft, seller, TOKEN_ID } = await loadFixture(deployFixture);
      const PRICE = parseEther("1");

      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
        account: seller.account
      });

      // Cek struct Listing
      const listing = await marketplace.read.listings([testNft.address, TOKEN_ID]);
      expect(listing[0]).to.equal(PRICE); // Price
      expect(listing[1].toLowerCase()).to.equal(seller.account.address.toLowerCase()); // Seller

      // Cek NFT ownership (Harus pindah ke contract)
      const newOwner = await testNft.read.ownerOf([TOKEN_ID]);
      expect(newOwner.toLowerCase()).to.equal(marketplace.address.toLowerCase());
    });

    it("Should fail if price is zero", async function () {
      const { marketplace, testNft, seller, TOKEN_ID } = await loadFixture(deployFixture);
      
      await expect(
        marketplace.write.listItem([testNft.address, TOKEN_ID, 0n], {
          account: seller.account
        })
      ).to.be.rejectedWith("PriceMustBeAboveZero");
    });

    it("Should fail if item already listed", async function () {
      const { marketplace, testNft, seller, TOKEN_ID } = await loadFixture(deployFixture);
      const PRICE = parseEther("1");

      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
        account: seller.account
      });

      await expect(
        marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
          account: seller.account
        })
      ).to.be.rejectedWith("AlreadyListed");
    });

    it("Should fail if not owner of NFT", async function () {
      const { marketplace, testNft, buyer, TOKEN_ID } = await loadFixture(deployFixture);
      const PRICE = parseEther("1");

      // Buyer coba jual barang milik Seller
      await expect(
        marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
          account: buyer.account
        })
      ).to.be.rejectedWith("NotOwner");
    });
  });

  // --- BUYING LOGIC & REFUND ---
  describe("Buying Logic", function () {
    const PRICE = parseEther("1");

    async function setupListing(fixture: any) {
      const { marketplace, testNft, seller, TOKEN_ID } = fixture;
      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
        account: seller.account
      });
    }

    it("Should transfer NFT to buyer and distribute fees", async function () {
      const { marketplace, testNft, owner, seller, buyer, TOKEN_ID } = await loadFixture(deployFixture);
      await setupListing({ marketplace, testNft, seller, TOKEN_ID });

      await marketplace.write.buyItem([testNft.address, TOKEN_ID], {
        account: buyer.account,
        value: PRICE
      });

      //  Cek Owner Baru NFT
      expect(await testNft.read.ownerOf([TOKEN_ID])).to.equal(getAddress(buyer.account.address));

      // Cek Fee (2%)
      const feeAmount = (PRICE * 2n) / 100n;
      const sellerProceeds = PRICE - feeAmount;

      const sellerBalance = await marketplace.read.proceeds([seller.account.address]);
      const ownerBalance = await marketplace.read.proceeds([owner.account.address]);

      expect(sellerBalance).to.equal(sellerProceeds);
      expect(ownerBalance).to.equal(feeAmount);
    });

    it("Should refund excess ETH (Auto-Refund)", async function () {
      const { marketplace, testNft, seller, buyer, TOKEN_ID, publicClient } = await loadFixture(deployFixture);
      await setupListing({ marketplace, testNft, seller, TOKEN_ID });

      const SENT_AMOUNT = parseEther("5"); 
      
      const balanceBefore = await publicClient.getBalance({ address: buyer.account.address });

      const hash = await marketplace.write.buyItem([testNft.address, TOKEN_ID], {
        account: buyer.account,
        value: SENT_AMOUNT
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
      const balanceAfter = await publicClient.getBalance({ address: buyer.account.address });

      // Uang berkurang harusnya cuma: Harga + Gas (Bukan 5 ETH)
      const actualCost = balanceBefore - balanceAfter;
      const expectedCost = PRICE + gasCost;

      expect(actualCost).to.equal(expectedCost);
    });

    it("Should fail if price not met", async function () {
      const { marketplace, testNft, seller, buyer, TOKEN_ID } = await loadFixture(deployFixture);
      await setupListing({ marketplace, testNft, seller, TOKEN_ID });

      await expect(
        marketplace.write.buyItem([testNft.address, TOKEN_ID], {
          account: buyer.account,
          value: parseEther("0.01") 
        })
      ).to.be.rejectedWith("PriceNotMet");
    });
  });

  // ---  UPDATING & CANCELING ---
  describe("Update & Cancel", function () {
    const PRICE = parseEther("1");

    async function setupListing(fixture: any) {
      const { marketplace, testNft, seller, TOKEN_ID } = fixture;
      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], {
        account: seller.account
      });
    }

    it("Should allow seller to update price", async function () {
      const { marketplace, testNft, seller, TOKEN_ID } = await loadFixture(deployFixture);
      await setupListing({ marketplace, testNft, seller, TOKEN_ID });

      const NEW_PRICE = parseEther("2");
      await marketplace.write.updateListing([testNft.address, TOKEN_ID, NEW_PRICE], {
        account: seller.account
      });

      const listing = await marketplace.read.listings([testNft.address, TOKEN_ID]);
      expect(listing[0]).to.equal(NEW_PRICE);
    });

    it("Should allow seller to cancel listing and get NFT back", async function () {
      const { marketplace, testNft, seller, TOKEN_ID } = await loadFixture(deployFixture);
      await setupListing({ marketplace, testNft, seller, TOKEN_ID });

      await marketplace.write.cancelListing([testNft.address, TOKEN_ID], {
        account: seller.account
      });

      // NFT harus kembali ke Seller
      expect(await testNft.read.ownerOf([TOKEN_ID])).to.equal(getAddress(seller.account.address));
      
      // Listing harus terhapus
      const listing = await marketplace.read.listings([testNft.address, TOKEN_ID]);
      expect(listing[0]).to.equal(0n); 
    });
  });

  // --- WITHDRAWAL ---
  describe("Withdrawal", function () {
    it("Should allow seller to withdraw proceeds", async function () {
      const { marketplace, testNft, seller, buyer, TOKEN_ID, publicClient } = await loadFixture(deployFixture);
      const PRICE = parseEther("10");

      //  Listing & Buy
      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], { account: seller.account });
      await marketplace.write.buyItem([testNft.address, TOKEN_ID], { account: buyer.account, value: PRICE });

      //  Withdraw
      const balanceBefore = await publicClient.getBalance({ address: seller.account.address });
      
      const hash = await marketplace.write.withdrawProceeds({ account: seller.account });
      
      const receipt = await publicClient.getTransactionReceipt({ hash });
      const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
      const balanceAfter = await publicClient.getBalance({ address: seller.account.address });

      // Seller dapet: (Harga - Fee) - Gas Withdraw
      const fee = (PRICE * 2n) / 100n;
      const proceeds = PRICE - fee;
      
      expect(balanceAfter).to.equal(balanceBefore + proceeds - gasCost);
    });

    it("Should fail if no proceeds", async function () {
      const { marketplace, seller } = await loadFixture(deployFixture);
      await expect(
        marketplace.write.withdrawProceeds({ account: seller.account })
      ).to.be.rejectedWith("NoProceeds");
    });
  });

  // ---  GOVERNANCE & SECURITY ---
  describe("Governance & Security", function () {
    
    it("Should allow owner to update fee", async function () {
      const { marketplace, owner } = await loadFixture(deployFixture);
      await marketplace.write.updateFeePercent([5n], { account: owner.account });
      expect(await marketplace.read.feePercent()).to.equal(5n);
    });

    it("Should fail if fee > 20%", async function () {
      const { marketplace, owner } = await loadFixture(deployFixture);
      await expect(
        marketplace.write.updateFeePercent([21n], { account: owner.account })
      ).to.be.rejectedWith("FeeTooHigh");
    });

    it("Should allow owner to Pause and Unpause", async function () {
      const { marketplace, owner, testNft, seller, TOKEN_ID } = await loadFixture(deployFixture);
      const PRICE = parseEther("1");

      //  Pause
      await marketplace.write.pause({ account: owner.account });

      // Coba List Item (Harus Gagal)
      await expect(
        marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], { account: seller.account })
      ).to.be.rejectedWith("EnforcedPause");

      // Unpause
      await marketplace.write.unpause({ account: owner.account });

      // Coba List Lagi (Harus Sukses)
      await expect(
        marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], { account: seller.account })
      ).to.not.be.rejected;
    });

    it("Should allow Emergency Withdraw by Owner", async function () {
      const { marketplace, testNft, seller, owner, TOKEN_ID } = await loadFixture(deployFixture);
      const PRICE = parseEther("1");

      // Seller List Item
      await marketplace.write.listItem([testNft.address, TOKEN_ID, PRICE], { account: seller.account });

      // Owner Tarik Paksa (Emergency)
      await marketplace.write.EmergencyWithdrawNft(
        [testNft.address, TOKEN_ID, owner.account.address], 
        { account: owner.account }
      );

      expect(await testNft.read.ownerOf([TOKEN_ID])).to.equal(getAddress(owner.account.address));
    });
  });
});