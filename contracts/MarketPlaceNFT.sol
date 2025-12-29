// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    event NftMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    constructor() ERC721("7ONG COLLECTION","7ONG") Ownable(msg.sender) {}

    // create token
    function createToken(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit NftMinted(tokenId, msg.sender, tokenURI);
        return tokenId;
    }

}