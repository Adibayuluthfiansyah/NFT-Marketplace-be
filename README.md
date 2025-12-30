# NFT Marketplace Backend

> A secure and feature-rich NFT marketplace smart contract built with Hardhat, Solidity, and modern Web3 tools.

## ⚠️ Development Status

**This project is in active development and has NOT been audited.**

- ✅ **Testnet ready** - Sepolia, Hardhat local network
- ✅ **Comprehensive test suite** - 90%+ coverage with 20+ test cases
- ⚠️ **NOT ready for mainnet** - Professional audit required
- 🤝 **Contributions welcome!** - Open for collaboration

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Smart Contracts](#-smart-contracts)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Roadmap](#️-roadmap)
- [Contributing](#-contributing)

---

## 🛠️ Tech Stack

- **Solidity**: 0.8.28
- **Hardhat**: ^2.22.5
- **Viem**: ^2.13.0 (Modern alternative to ethers.js)
- **TypeScript**: ^5.4.0
- **OpenZeppelin Contracts**: ^5.4.0
- **Test Framework**: Mocha + Chai via Hardhat Toolbox

---

## 📁 Project Structure

```
NFT-Marketplace-be/
├── contracts/
│   ├── NFTMarketplace.sol      # Main marketplace contract
│   ├── MarketPlaceNFT.sol      # ERC721 NFT contract (production)
│   └── TestNFT.sol             # Simple NFT for testing
├── test/
│   └── NFTMarketplace.ts       # Comprehensive test suite
├── ignition/modules/
│   └── NFTMarketplace.ts       # Deployment with Hardhat Ignition
├── .github/
│   └── SECURITY.md             # Security policy & vulnerability reporting
├── hardhat.config.ts           # Hardhat configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

### 🔒 Environment Setup

**CRITICAL: Before making any commits, ensure these files are in `.gitignore`:**

```bash
# Already included in .gitignore, but double-check:
.env
.env.local
.env.production
secrets.json
*.key
*.pem
mnemonic.txt
```

**For testnet deployment, create `.env` file:**

```bash
# .env (NEVER commit this file!)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security Reminder**: Use a dedicated wallet for development. Never use your main wallet's private key!

---

## 📜 Smart Contracts

### 1. NFTMarketplace.sol

**Main marketplace contract** with comprehensive features for buying and selling NFTs.

#### ✨ Key Features

- **List Item** - Sellers can list NFTs with custom pricing
- **Buy Item** - Buyers can purchase NFTs with automatic excess ETH refund
- **Update Listing** - Sellers can modify their listing prices
- **Cancel Listing** - Sellers can delist and reclaim their NFTs
- **Withdraw Proceeds** - Secure withdrawal of earned funds
- **Fee Management** - Configurable marketplace fee (max 20%)
- **Admin Controls** - Pause/unpause functionality for emergencies

#### 🔒 Security Features

Built with industry-standard security patterns:

- ✅ **ReentrancyGuard** - Protection against reentrancy attacks
- ✅ **Ownable** - Access control for administrative functions
- ✅ **Pausable** - Circuit breaker for emergency situations
- ✅ **Custom Errors** - Gas-efficient error handling
- ✅ **Pull Payment Pattern** - Safe withdrawal mechanism
- ✅ **Checks-Effects-Interactions** - Secure function ordering

#### 💰 Fee Structure

- **Default Fee**: 2% of sale price
- **Maximum Fee**: 20% (hardcoded limit for user protection)
- **Distribution**: 
  - Seller receives: `price - (price * feePercent / 100)`
  - Owner receives: `price * feePercent / 100`

#### Example Usage

```solidity
// List an NFT
marketplace.listItem(nftAddress, tokenId, priceInWei);

// Buy an NFT (auto-refund excess ETH)
marketplace.buyItem{value: 1 ether}(nftAddress, tokenId);

// Update listing price
marketplace.updateListing(nftAddress, tokenId, newPriceInWei);

// Cancel listing and reclaim NFT
marketplace.cancelListing(nftAddress, tokenId);

// Withdraw your earnings
marketplace.withdrawProceeds();
```

### 2. MarketPlaceNFT.sol

**ERC721 NFT contract** for production use with IPFS support.

**Features:**
- ✅ ERC721URIStorage (IPFS metadata support)
- ✅ ERC721Enumerable (query all tokens owned)
- ✅ Auto-incrementing token IDs
- ✅ Media type tracking (image/audio/video)

**Collection Details:**
- Name: `7ONG COLLECTION`
- Symbol: `7ONG`

```solidity
// Mint NFT with IPFS URI
string memory ipfsUri = "ipfs://QmXYZ...";
uint256 tokenId = nftContract.createToken(ipfsUri, "image");
```

### 3. TestNFT.sol

**Simple ERC721** for testing purposes:
- Public mint function (anyone can mint)
- Batch minting support
- Manual token ID specification

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with explicit command
npx hardhat test

# Run specific test by name
npx hardhat test --grep "Should allow seller to list an item"

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### Test Coverage

Comprehensive test suite covering **90%+ of contract functionality** with **20+ test cases**:

#### Test Categories

✅ **Deployment Tests**
- Contract initialization
- Owner assignment
- Fee configuration

✅ **Listing Logic Tests**
- Successful item listing
- Zero price prevention
- Duplicate listing prevention
- Ownership verification
- NFT transfer to contract

✅ **Buying Logic Tests**
- NFT transfer to buyer
- Fee distribution (2% platform, 98% seller)
- Excess ETH auto-refund
- Insufficient payment rejection
- Self-purchase prevention

✅ **Update & Cancel Tests**
- Price updates by seller
- Listing cancellation
- NFT return to seller

✅ **Withdrawal Tests**
- Proceeds withdrawal
- Balance calculations
- Zero balance rejection

✅ **Governance & Security Tests**
- Fee updates (max 20% limit)
- Pause/unpause functionality
- Admin access control
- Emergency functions

### Testing Patterns

This project uses the **fixture pattern** for clean and reusable test setup:

```typescript
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

async function deployFixture() {
  const [owner, seller, buyer] = await viem.getWalletClients();
  const marketplace = await viem.deployContract("NFTMarketplace", [2n]);
  const testNft = await viem.deployContract("TestNFT");
  
  // Setup initial state...
  return { marketplace, testNft, owner, seller, buyer };
}

// Usage in tests
it("Should list an item", async function () {
  const { marketplace, seller } = await loadFixture(deployFixture);
  // Test implementation...
});
```

#### Viem-Specific Patterns

```typescript
// BigInt literals for gas efficiency
const TOKEN_ID = 1n;
const FEE_PERCENT = 2n;

// Parse ether amounts
const PRICE = parseEther("1");

// Write transactions with account parameter
await marketplace.write.listItem([nftContract, tokenId, price], {
  account: seller.account,
  value: parseEther("1")
});

// Read contract state
const fee = await marketplace.read.feePercent();
const listing = await marketplace.read.listings([nftContract, tokenId]);

// Address comparison with checksumming
expect(await nft.read.ownerOf([tokenId])).to.equal(getAddress(buyer.account.address));
```

---

## 🚀 Deployment

### Local Development

```bash
# Start local Hardhat network
npx hardhat node

# In another terminal, deploy
npx hardhat ignition deploy ./ignition/modules/NFTMarketplace.ts --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat ignition deploy ./ignition/modules/NFTMarketplace.ts --network sepolia
```

### Deployment Module

The project uses **Hardhat Ignition** for deterministic deployments:

```typescript
// ignition/modules/NFTMarketplace.ts
const NFTMarketplaceModule = buildModule("NFTMarketplaceModule", (m) => {
  const feePercent = m.getParameter("feePercent", 2); // Default 2%
  const marketplace = m.contract("NFTMarketplace", [feePercent]);
  return { marketplace };
});
```

### Deploy with Custom Parameters

```bash
npx hardhat ignition deploy ./ignition/modules/NFTMarketplace.ts \
  --parameters '{"NFTMarketplaceModule":{"feePercent":5}}' \
  --network sepolia
```

### Network Configuration (Optional)

To deploy to testnets, add to `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

export default config;
```

---

## 🔒 Security

### Security Architecture

This contract implements multiple layers of security following industry best practices:

- **ReentrancyGuard**: All state-changing functions are protected against reentrancy attacks
- **Access Control**: Administrative functions restricted to contract owner
- **Pausable Mechanism**: Emergency circuit breaker for critical situations
- **Pull Payment Pattern**: Users withdraw their own funds (safer than push payments)
- **Custom Errors**: Gas-efficient error handling (Solidity 0.8.28)
- **Safe Math**: Built-in overflow protection in Solidity 0.8.x
- **Fee Limits**: Maximum 20% fee hardcoded for user protection

### Development Security Practices

When developing with this codebase:

1. ✅ **Never commit sensitive files**
   - Check `.gitignore` is configured correctly
   - Use separate wallets for dev/test/production
   - Store private keys in `.env` (never in code)

2. ✅ **Always test on testnet first**
   - Use Sepolia for realistic testing
   - Test all functions thoroughly
   - Monitor gas costs

3. ✅ **Use hardware wallets for production**
   - Ledger or Trezor for mainnet
   - Multi-signature wallet for owner address
   - Implement timelock for critical operations

### Security Disclaimer

⚠️ **This smart contract has NOT been professionally audited.**

- Suitable for testnet and educational purposes
- NOT recommended for mainnet without professional security audit
- Use at your own risk
- Always perform thorough testing

**For production deployment:**
- Professional audit required (OpenZeppelin, CertiK, Trail of Bits, etc.)
- Extended testnet period (minimum 2-4 weeks)
- Bug bounty program recommended
- Multi-signature wallet for owner
- Insurance or safeguards consideration

### Reporting Security Issues

Found a vulnerability? Please report responsibly:
- See [SECURITY.md](.github/SECURITY.md) for reporting guidelines
- Do NOT open public issues for security vulnerabilities
- We appreciate responsible disclosure

---

## 🗺️ Roadmap

### Current Phase: Local Development & Frontend Integration

- [x] Smart contract development
- [x] Comprehensive test suite (20+ tests, 90%+ coverage)
- [x] Security best practices implementation
- [ ] Frontend integration
- [ ] Extended testnet testing (Sepolia)
- [ ] Community review & feedback
- [ ] Gas optimization review
- [ ] Professional security audit
- [ ] Mainnet deployment preparation

### Future Plans

- 🌐 Multi-chain support (Polygon, Arbitrum, Base)
- 🎨 Advanced marketplace features (auctions, offers, bundles)
- 🏛️ DAO governance for fee management
- 📊 Analytics & reporting dashboard
- 🔔 Event indexing & notifications
- 🤖 Royalty enforcement standards (EIP-2981)

---

## 🤝 Contributing

This is an open-source project and **contributions are welcome!** We're building in public and learning together.

### Areas Where You Can Help

- 🧪 **Testing** - Test on different networks, report bugs
- 📝 **Documentation** - Improve guides, add examples
- 🔒 **Security Review** - Review code, suggest improvements
- 🎨 **Frontend Development** - Build/improve the UI
- 💡 **Feature Ideas** - Suggest new marketplace features
- 🌍 **Translations** - Help with i18n

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Read the code & tests** to understand the system
4. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation
5. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
6. **Push to your branch** (`git push origin feature/AmazingFeature`)
7. **Open a Pull Request**

### Code Style Guidelines

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: Maintain 90%+ coverage for new features
- **Comments**: Add NatSpec documentation for public functions

### Questions or Ideas?

- Open a GitHub issue for discussion
- Start with small contributions to get familiar with the codebase
- Don't hesitate to ask questions!

---

## 🛠️ Development Commands

```bash
# Compile contracts
npm run compile
npx hardhat compile

# Run all tests
npm test
npx hardhat test

# Run specific test
npx hardhat test --grep "test name"

# Start local blockchain
npx hardhat node

# Deploy contracts
npm run deploy
npx hardhat ignition deploy ./ignition/modules/NFTMarketplace.ts

# Clean build artifacts
npx hardhat clean

# Get help
npx hardhat help
```

---

## 📝 Contract ABIs

After compilation, ABIs are available at:
- `artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json`
- `artifacts/contracts/MarketPlaceNFT.sol/MarketPlaceNFT.json`

Copy ABI to frontend:
```bash
cp artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json ../NFT-Marketplace-fe/app/abi/
```

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Viem](https://viem.sh/) - Modern TypeScript library for Ethereum

---

## 📧 Support

- 📖 Read the [Documentation](./)
- 🐛 Report bugs via [GitHub Issues](../../issues)
- 🔒 Security issues: See [SECURITY.md](.github/SECURITY.md)
- 💬 Discussions: [GitHub Discussions](../../discussions)

---

<div align="center">

**Built with ❤️ for the Web3 community**

⭐ Star this repo if you find it helpful!

</div>
