// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MarketPlaceNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    
    event NftMinted(uint256 indexed tokenId, address indexed owner, string tokenURI, string mediaType);
    
    constructor() ERC721("7ONG COLLECTION","7ONG") Ownable(msg.sender) {}

    /**
     * @dev Create NFT dengan IPFS tokenURI
     * @param _tokenURI Format: "ipfs://QmXYZ..." (Fixed: sesuaikan dengan nama parameter)
     * @param mediaType Tipe media: "image", "audio", atau "video"
     */
    function createToken(string memory _tokenURI, string memory mediaType) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        emit NftMinted(tokenId, msg.sender, _tokenURI, mediaType);
        return tokenId;
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}