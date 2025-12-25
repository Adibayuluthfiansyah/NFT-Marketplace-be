// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ReentrancyGuard,Ownable {
  struct Listing {
    uint256 price;
    address seller;
    bool isActive;
  }
  uint256 public feePercent;
  mapping(address => mapping(uint256 => Listing)) public listings;
  mapping(address => uint256) public balances;

  // Events listed here
  event ItemListed(
    address indexed nftContract,
    uint256 price,
    uint256 indexed tokenId,
    address seller
  );

  // Events listed here
  event ItemBought(
    address indexed nftContract,
    uint256 price,
    uint256 indexed tokenId,
    address buyer
  );

  // Events FundsWithdrawn
  event FundsWithdrawn(
    address indexed beneficiary,
    uint256 amount
  );

   // getter for feePercent Deployment
   constructor(uint256 _feePercent) Ownable (msg.sender) {
    feePercent = _feePercent;
   }

   //function list item
   function listItem(address _nftContract, uint256 _tokenId, uint256 _price) external nonReentrant{
      require(_price > 0, "Invalid Balance, Please Check Your Balance");
      IERC721 nft = IERC721(_nftContract);
      require(nft.ownerOf(_tokenId) == msg.sender,"Invalid Owner");
      require(nft.isApprovedForAll(msg.sender, address(this)), "Contract Not Approved");
      listings[_nftContract][_tokenId] = Listing(_price,msg.sender,true);
      nft.transferFrom(msg.sender,address(this),_tokenId);
      emit ItemListed(_nftContract,_price,_tokenId,msg.sender);
   }

   //function buy item
   function buyItem(address _nftContract, uint256 _tokenId) external payable nonReentrant{
      Listing storage listing = listings[_nftContract][_tokenId];
      require(listing.isActive,"Item Not Listed or Already Sold");
      require(msg.value >= listing.price, "Insufficient Funds Sent");
      listing.isActive = false; //mark as sold

      // Calculate fee
      uint256 totalPrice = msg.value;
      uint256 feeAmount = (totalPrice * feePercent) / 100;
      uint256 sellerAmount = totalPrice - feeAmount;

      // update balances
      balances[listing.seller] += sellerAmount;
      balances[owner()] += feeAmount;

      // Transfer NFT to buyer
      IERC721(_nftContract).transferFrom(address(this), msg.sender, _tokenId);
      emit ItemBought(_nftContract, listing.price, _tokenId, msg.sender);
   }

   //function withdraw proccess
  function withdrawProceeds() external nonReentrant {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "No Funds to Withdraw");
    balances[msg.sender] = 0;
    (bool success,) = payable(msg.sender).call{value: amount}("");
    require(success, "Withdrawal Failed");
    emit FundsWithdrawn(msg.sender, amount);
  }
}

