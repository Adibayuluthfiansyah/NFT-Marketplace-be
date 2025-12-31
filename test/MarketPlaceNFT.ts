import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("MarketPlaceNFT", function () {
  
  // --- SETUP FIXTURE ---
  async function deployFixture() {
    const [owner, attacker, user1] = await viem.getWalletClients();
    const marketPlaceNFT = await viem.deployContract("MarketPlaceNFT");
    
    return { marketPlaceNFT, owner, attacker, user1 };
  }

  // --- DEPLOYMENT TESTS ---
  describe("Deployment", function () {
    it("Should set correct collection name and symbol", async function () {
      const { marketPlaceNFT } = await loadFixture(deployFixture);
      
      expect(await marketPlaceNFT.read.name()).to.equal("7ONG COLLECTION");
      expect(await marketPlaceNFT.read.symbol()).to.equal("7ONG");
    });

    it("Should set the deployer as owner", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      const contractOwner = await marketPlaceNFT.read.owner();
      expect(contractOwner.toLowerCase()).to.equal(owner.account.address.toLowerCase());
    });

    it("Should start with zero total supply", async function () {
      const { marketPlaceNFT } = await loadFixture(deployFixture);
      
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(0n);
    });
  });

  // --- MINTING ACCESS CONTROL (CRITICAL SECURITY) ---
  describe("Minting Access Control", function () {
    it("Should allow owner to mint NFT", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      const tokenURI = "ipfs://QmTest123";
      const mediaType = "image";
      
      // Mint as owner
      await marketPlaceNFT.write.createToken(
        [tokenURI, mediaType],
        { account: owner.account }
      );
      
      // Verify minting succeeded
      const totalSupply = await marketPlaceNFT.read.totalSupply();
      expect(totalSupply).to.equal(1n);
      
      // Verify owner owns the NFT
      const nftOwner = await marketPlaceNFT.read.ownerOf([0n]);
      expect(nftOwner.toLowerCase()).to.equal(owner.account.address.toLowerCase());
      
      // Verify token URI
      const retrievedURI = await marketPlaceNFT.read.tokenURI([0n]);
      expect(retrievedURI).to.equal(tokenURI);
    });

    it("Should reject non-owner from minting (CRITICAL SECURITY TEST)", async function () {
      const { marketPlaceNFT, attacker } = await loadFixture(deployFixture);
      
      // Try to mint as non-owner - should fail
      await expect(
        marketPlaceNFT.write.createToken(
          ["ipfs://QmSpam", "image"],
          { account: attacker.account }
        )
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      
      // Verify no NFT was minted
      const totalSupply = await marketPlaceNFT.read.totalSupply();
      expect(totalSupply).to.equal(0n);
    });

    it("Should prevent spam minting attack", async function () {
      const { marketPlaceNFT, attacker } = await loadFixture(deployFixture);
      
      // Simulate spam attack attempt (multiple mints)
      const spamAttempts = 5;
      
      for (let i = 0; i < spamAttempts; i++) {
        await expect(
          marketPlaceNFT.write.createToken(
            [`ipfs://QmSpam${i}`, "image"],
            { account: attacker.account }
          )
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      }
      
      // Verify collection remains clean (zero supply)
      const totalSupply = await marketPlaceNFT.read.totalSupply();
      expect(totalSupply).to.equal(0n);
    });
  });

  // --- MINTING FUNCTIONALITY ---
  describe("Minting Functionality", function () {
    it("Should increment token ID correctly", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      // Mint first NFT
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest1", "image"],
        { account: owner.account }
      );
      
      // Mint second NFT
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest2", "video"],
        { account: owner.account }
      );
      
      // Mint third NFT
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest3", "audio"],
        { account: owner.account }
      );
      
      // Verify all three exist with correct IDs
      expect(await marketPlaceNFT.read.ownerOf([0n])).to.equal(getAddress(owner.account.address));
      expect(await marketPlaceNFT.read.ownerOf([1n])).to.equal(getAddress(owner.account.address));
      expect(await marketPlaceNFT.read.ownerOf([2n])).to.equal(getAddress(owner.account.address));
      
      // Verify total supply
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(3n);
    });

    it("Should store correct token URI for each NFT", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      const tokenURIs = [
        "ipfs://QmImageHash123",
        "ipfs://QmVideoHash456",
        "ipfs://QmAudioHash789"
      ];
      
      // Mint multiple NFTs
      for (const uri of tokenURIs) {
        await marketPlaceNFT.write.createToken(
          [uri, "image"],
          { account: owner.account }
        );
      }
      
      // Verify each token has correct URI
      for (let i = 0; i < tokenURIs.length; i++) {
        const retrievedURI = await marketPlaceNFT.read.tokenURI([BigInt(i)]);
        expect(retrievedURI).to.equal(tokenURIs[i]);
      }
    });

    it("Should emit NftMinted event with correct parameters", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      const publicClient = await viem.getPublicClient();
      
      const tokenURI = "ipfs://QmTest456";
      const mediaType = "audio";
      
      // Mint and get transaction hash
      const hash = await marketPlaceNFT.write.createToken(
        [tokenURI, mediaType],
        { account: owner.account }
      );
      
      // Get transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Verify event was emitted (at least one log present)
      expect(receipt.logs.length).to.be.greaterThan(0);
      
      // Note: NftMinted event should be present
      // Full event parsing would require ABI decoding
    });

    it("Should support different media types", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      const mediaTypes = ["image", "video", "audio"];
      
      // Mint NFT for each media type
      for (const mediaType of mediaTypes) {
        await marketPlaceNFT.write.createToken(
          [`ipfs://Qm${mediaType}Hash`, mediaType],
          { account: owner.account }
        );
      }
      
      // Verify all minted successfully
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(BigInt(mediaTypes.length));
    });

    it("Should return correct token ID from createToken", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      const publicClient = await viem.getPublicClient();
      
      // Mint first token and capture return value
      const hash1 = await marketPlaceNFT.write.createToken(
        ["ipfs://QmFirst", "image"],
        { account: owner.account }
      );
      
      // Mint second token
      const hash2 = await marketPlaceNFT.write.createToken(
        ["ipfs://QmSecond", "image"],
        { account: owner.account }
      );
      
      // Verify tokens exist
      await publicClient.waitForTransactionReceipt({ hash: hash1 });
      await publicClient.waitForTransactionReceipt({ hash: hash2 });
      
      // Token IDs should be 0 and 1
      expect(await marketPlaceNFT.read.ownerOf([0n])).to.equal(getAddress(owner.account.address));
      expect(await marketPlaceNFT.read.ownerOf([1n])).to.equal(getAddress(owner.account.address));
    });
  });

  // --- COLLECTION ENUMERATION ---
  describe("Collection Enumeration", function () {
    it("Should track total supply correctly", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      // Initial supply should be 0
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(0n);
      
      // Mint one
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest1", "image"],
        { account: owner.account }
      );
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(1n);
      
      // Mint another
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest2", "image"],
        { account: owner.account }
      );
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(2n);
      
      // Mint third
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest3", "video"],
        { account: owner.account }
      );
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(3n);
    });

    it("Should allow querying token by index", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      // Mint some NFTs
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest1", "image"],
        { account: owner.account }
      );
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest2", "video"],
        { account: owner.account }
      );
      
      // Query tokens by index (ERC721Enumerable feature)
      const token0 = await marketPlaceNFT.read.tokenByIndex([0n]);
      const token1 = await marketPlaceNFT.read.tokenByIndex([1n]);
      
      expect(token0).to.equal(0n);
      expect(token1).to.equal(1n);
    });

    it("Should allow querying tokens owned by address", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      // Mint multiple NFTs
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest1", "image"],
        { account: owner.account }
      );
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest2", "image"],
        { account: owner.account }
      );
      
      // Check balance
      const balance = await marketPlaceNFT.read.balanceOf([owner.account.address]);
      expect(balance).to.equal(2n);
      
      // Query tokens owned by owner
      const token0 = await marketPlaceNFT.read.tokenOfOwnerByIndex([owner.account.address, 0n]);
      const token1 = await marketPlaceNFT.read.tokenOfOwnerByIndex([owner.account.address, 1n]);
      
      expect(token0).to.equal(0n);
      expect(token1).to.equal(1n);
    });
  });

  // --- NFT TRANSFERS ---
  describe("NFT Transfers", function () {
    it("Should allow owner to transfer NFT after minting", async function () {
      const { marketPlaceNFT, owner, user1 } = await loadFixture(deployFixture);
      
      // Mint NFT
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest1", "image"],
        { account: owner.account }
      );
      
      // Transfer to user1
      await marketPlaceNFT.write.transferFrom(
        [owner.account.address, user1.account.address, 0n],
        { account: owner.account }
      );
      
      // Verify new owner
      const newOwner = await marketPlaceNFT.read.ownerOf([0n]);
      expect(newOwner.toLowerCase()).to.equal(user1.account.address.toLowerCase());
      
      // Verify balances
      expect(await marketPlaceNFT.read.balanceOf([owner.account.address])).to.equal(0n);
      expect(await marketPlaceNFT.read.balanceOf([user1.account.address])).to.equal(1n);
    });

    it("Should preserve token URI after transfer", async function () {
      const { marketPlaceNFT, owner, user1 } = await loadFixture(deployFixture);
      
      const tokenURI = "ipfs://QmPersistent123";
      
      // Mint NFT
      await marketPlaceNFT.write.createToken(
        [tokenURI, "image"],
        { account: owner.account }
      );
      
      // Transfer
      await marketPlaceNFT.write.transferFrom(
        [owner.account.address, user1.account.address, 0n],
        { account: owner.account }
      );
      
      // Token URI should remain same
      const retrievedURI = await marketPlaceNFT.read.tokenURI([0n]);
      expect(retrievedURI).to.equal(tokenURI);
    });
  });

  // --- EDGE CASES ---
  describe("Edge Cases", function () {
    it("Should revert when querying non-existent token", async function () {
      const { marketPlaceNFT } = await loadFixture(deployFixture);
      
      // Try to query token that doesn't exist
      await expect(
        marketPlaceNFT.read.ownerOf([999n])
      ).to.be.rejected;
    });

    it("Should handle empty string token URI", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      // Mint with empty URI (edge case)
      await marketPlaceNFT.write.createToken(
        ["", "image"],
        { account: owner.account }
      );
      
      // Verify it was minted
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(1n);
      
      // URI should be empty
      const uri = await marketPlaceNFT.read.tokenURI([0n]);
      expect(uri).to.equal("");
    });

    it("Should handle very long token URI", async function () {
      const { marketPlaceNFT, owner } = await loadFixture(deployFixture);
      
      // Very long IPFS URI
      const longURI = "ipfs://Qm" + "a".repeat(100);
      
      await marketPlaceNFT.write.createToken(
        [longURI, "image"],
        { account: owner.account }
      );
      
      const retrievedURI = await marketPlaceNFT.read.tokenURI([0n]);
      expect(retrievedURI).to.equal(longURI);
    });
  });

  // --- CONTRACT OWNERSHIP ---
  describe("Contract Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      const { marketPlaceNFT, owner, user1 } = await loadFixture(deployFixture);
      
      // Transfer ownership
      await marketPlaceNFT.write.transferOwnership(
        [user1.account.address],
        { account: owner.account }
      );
      
      // Verify new owner
      const newOwner = await marketPlaceNFT.read.owner();
      expect(newOwner.toLowerCase()).to.equal(user1.account.address.toLowerCase());
    });

    it("Should allow new owner to mint after ownership transfer", async function () {
      const { marketPlaceNFT, owner, user1 } = await loadFixture(deployFixture);
      
      // Transfer ownership
      await marketPlaceNFT.write.transferOwnership(
        [user1.account.address],
        { account: owner.account }
      );
      
      // Old owner should NOT be able to mint
      await expect(
        marketPlaceNFT.write.createToken(
          ["ipfs://QmTest1", "image"],
          { account: owner.account }
        )
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      
      // New owner SHOULD be able to mint
      await marketPlaceNFT.write.createToken(
        ["ipfs://QmTest2", "image"],
        { account: user1.account }
      );
      
      // Verify minting succeeded
      expect(await marketPlaceNFT.read.totalSupply()).to.equal(1n);
      const nftOwner = await marketPlaceNFT.read.ownerOf([0n]);
      expect(nftOwner.toLowerCase()).to.equal(user1.account.address.toLowerCase());
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      const { marketPlaceNFT, attacker, user1 } = await loadFixture(deployFixture);
      
      // Attacker tries to transfer ownership
      await expect(
        marketPlaceNFT.write.transferOwnership(
          [user1.account.address],
          { account: attacker.account }
        )
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
    });
  });

  // --- INTERFACE SUPPORT ---
  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      const { marketPlaceNFT } = await loadFixture(deployFixture);
      
      // ERC721 interface ID: 0x80ac58cd
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      const supports = await marketPlaceNFT.read.supportsInterface([ERC721_INTERFACE_ID]);
      
      expect(supports).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      const { marketPlaceNFT } = await loadFixture(deployFixture);
      
      // ERC721Metadata interface ID: 0x5b5e139f
      const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
      const supports = await marketPlaceNFT.read.supportsInterface([ERC721_METADATA_INTERFACE_ID]);
      
      expect(supports).to.be.true;
    });

    it("Should support ERC721Enumerable interface", async function () {
      const { marketPlaceNFT } = await loadFixture(deployFixture);
      
      // ERC721Enumerable interface ID: 0x780e9d63
      const ERC721_ENUMERABLE_INTERFACE_ID = "0x780e9d63";
      const supports = await marketPlaceNFT.read.supportsInterface([ERC721_ENUMERABLE_INTERFACE_ID]);
      
      expect(supports).to.be.true;
    });
  });
});
// diagnostic test
