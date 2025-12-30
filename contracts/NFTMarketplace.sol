// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

error PriceNotMet (uint256 limit, uint256 sent);
error ItemNotForSale(address nftContract, uint256 tokenId);
error NotListed(address nftContract, uint256 tokenId);
error AlreadyListed(address nftContract, uint256 tokenId);
error NotOwner();
error NoProceeds();
error FeeTooHigh();
error PriceMustBeAboveZero();
error CannotBuyOwnItem();
error NotApprovedForMarketplace();
error EmergencyWithdrawFailed();


contract NFTMarketplace is ReentrancyGuard,Ownable, Pausable {
  struct Listing {
    uint256 price;
    address seller;
  }
  mapping(address => mapping(uint256 => Listing)) public listings;
  mapping(address => uint256) public proceeds;
  uint256 public feePercent;

  // Events listed here
  event ItemListed(
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 price,
    address seller
  );

  // Event Cancelled here
  event ItemCancelled(
    address indexed nftContract,
    uint256 indexed tokenId,
    address indexed seller
  );

  // Events bought here
  event ItemBought(
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 price,
    address buyer
  );

  // Events FundsWithdrawn
  event ProceedsWithdrawn(
    address indexed beneficiary,
    uint256 amount
  );

  event EmergencyWithdrawn(
    address indexed nftContract,
    uint256 indexed tokenId,
    address indexed to
  );

   // getter for feePercent Deployment
   constructor(uint256 _feePercent) Ownable (msg.sender) {
    if(_feePercent > 20) revert FeeTooHigh();
    feePercent = _feePercent;
   }

   //function list item
   function listItem(address _nftContract, uint256 _tokenId, uint256 _price) external nonReentrant whenNotPaused {
      if (_price == 0) revert PriceMustBeAboveZero();
      if(listings[_nftContract][_tokenId].price > 0) revert AlreadyListed(_nftContract,_tokenId);
      IERC721 nft = IERC721(_nftContract);
      if(nft.ownerOf(_tokenId) != msg.sender) revert NotOwner();
      if(!nft.isApprovedForAll(msg.sender,address(this))) revert NotApprovedForMarketplace();
      listings[_nftContract][_tokenId] = Listing(_price,msg.sender);
      emit ItemListed(_nftContract,_tokenId,_price,msg.sender);
      nft.transferFrom(msg.sender,address(this),_tokenId);
   }

   // function update listing
    function updateListing(address _nftContract, uint256 _tokenId, uint256 _newPrice) external nonReentrant whenNotPaused {
    Listing storage listedItem = listings[_nftContract][_tokenId];
    if(listedItem.seller != msg.sender) revert NotOwner();
    if (_newPrice == 0) revert PriceMustBeAboveZero();
    listedItem.price = _newPrice;
    emit ItemListed(_nftContract,_tokenId,_newPrice,msg.sender);
    }

  // function cancel listing
  function cancelListing(address _nftContract, uint256 _tokenId) external nonReentrant{
    Listing memory listedItem = listings[_nftContract][_tokenId];
    if(listedItem.price == 0) revert NotListed(_nftContract,_tokenId);
    if(listedItem.seller != msg.sender) revert NotOwner();
    delete(listings[_nftContract][_tokenId]);
    emit ItemCancelled(_nftContract,_tokenId,msg.sender);
    IERC721(_nftContract).transferFrom(address(this),msg.sender,_tokenId);
  }

   //function buy item
   function buyItem(address _nftContract, uint256 _tokenId) external payable nonReentrant whenNotPaused {
      Listing memory listedItem = listings[_nftContract][_tokenId];
      if(listedItem.price == 0) revert NotListed(_nftContract,_tokenId);
      if(msg.value < listedItem.price) revert PriceNotMet(listedItem.price,msg.value);
      if(listedItem.seller == msg.sender) revert CannotBuyOwnItem();
      uint256 excessAmount = msg.value - listedItem.price;

      delete(listings[_nftContract][_tokenId]);

      uint256 feeAmount = (listedItem.price * feePercent) / 100;
      uint256 sellerProceeds = listedItem.price - feeAmount;
      proceeds[listedItem.seller] += sellerProceeds;
      proceeds[owner()] += feeAmount;
      emit ItemBought(_nftContract,_tokenId,listedItem.price,msg.sender);
      IERC721(_nftContract).transferFrom(address(this),msg.sender,_tokenId);
      if(excessAmount > 0) {
        (bool success, ) = payable(msg.sender).call{value: excessAmount}("");
        require(success, "Refund failed");
      }
   }

   //function withdraw proccess
  function withdrawProceeds() external nonReentrant whenNotPaused {
    uint256 amount = proceeds[msg.sender];
    if (amount == 0) revert NoProceeds();
    proceeds[msg.sender] = 0;

    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Transfer failed");
    emit ProceedsWithdrawn(msg.sender, amount);
  }
  
  /**
 * @dev Emergency function untuk rescue NFT yang terjebak di kontrak ini.
 * Hanya bisa dipanggil oleh owner sebagai last resort
 */
  function EmergencyWithdrawNft(address _nftContract, uint256 _tokenId, address _to ) external onlyOwner nonReentrant {
    delete(listings[_nftContract][_tokenId]);
    try IERC721 (_nftContract).transferFrom(address(this),_to,_tokenId) {
      emit EmergencyWithdrawn(_nftContract,_tokenId,_to);
    }catch {
      revert EmergencyWithdrawFailed();
    }
  }

  //function to update fee percent
  function updateFeePercent(uint256 _newFeePercent) external onlyOwner {
    if(_newFeePercent > 20) revert FeeTooHigh();
    feePercent = _newFeePercent;
  }

  //function pause and unpause
  function pause() external onlyOwner {
    _pause();
  }
  function unpause() external onlyOwner {
    _unpause();
  }
}

