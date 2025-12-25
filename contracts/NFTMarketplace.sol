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
    address indexed seller,
    address indexed nftAddress,
    uint256 price,
    uint256 indexed tokenId
  );

  // Events listed here
  event ItemBought(
    address indexed buyer,
    address indexed nftAddress,
    uint256 price,
    uint256 indexed tokenId
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
      require(nft.isApprovedForAll(msg.sender,address(this)),"Contract Not Approved");
      require(nft.transferFrom(msg.sender,address(this),_tokenId),"Transfer Failed");
      emit ItemListed(msg.sender,_nftContract,_price,_tokenId);
   }

   //function buy item
   

}

