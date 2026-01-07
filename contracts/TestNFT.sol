// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
/**
 * @dev Simple NFT contract untuk testing marketplace
 * Siapapun bisa mint NFT dengan tokenId yang ditentukan
 */
contract TestNFT is ERC721 {
    constructor() ERC721("Test NFT", "TEST") {}
    /**
     * @dev Mint NFT untuk testing
     * @param to Address penerima NFT
     * @param tokenId Token ID yang akan di-mint
     */
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
    /**
     * @dev Mint batch untuk testing multiple NFTs
     */
    function mintBatch(address to, uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _mint(to, tokenIds[i]);
        }
    }
}
