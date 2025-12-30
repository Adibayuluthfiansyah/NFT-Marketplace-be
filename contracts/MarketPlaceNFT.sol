// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MarketPlaceNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    event NftMinted(uint256 indexed tokenId, address indexed owner, string tokenURI, string mediaType);
    constructor() ERC721("7ONG COLLECTION","7ONG") Ownable(msg.sender) {}

    /**
     * @dev Create NFT dengan IPFS tokenURI
     * @param tokenURI Format: "ipfs://QmXYZ..." (metadata JSON di IPFS)
     * @param mediaType Tipe media: "image", "audio", atau "video"
     * 
     * Metadata JSON structure:
     * {
     *   "name": "NFT Name",
     *   "description": "Description",
     *   "image": "ipfs://QmABC...", // Atau "animation_url" untuk video/audio
     *   "attributes": [...]
     * }
     */

    // create token
    function createToken(string memory tokenURI, string memory mediaType) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit NftMinted(tokenId, msg.sender, tokenURI, mediaType);
        return tokenId;
    }
     /**
     * @dev Get all tokens owned by an address
     * Note: Ini gas-intensive untuk banyak tokens, 
     */

     //function tokensOfOwner
     function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        for (uint256 i = 0; i < _nextTokenId; i ++) {
            if(_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }
        return tokenIds;
     }
}