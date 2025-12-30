# Contributing to NFT Marketplace Backend

First off, thank you for considering contributing to NFT Marketplace Backend! 🎉

We're building this project in the open and welcome contributions from developers of all skill levels. Whether you're fixing a bug, proposing a feature, or improving documentation, your help is appreciated.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

---

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

**TL;DR**: Be respectful, inclusive, and professional.

---

## 💡 How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? Help us improve by reporting it!

1. **Check existing issues** - Someone might have already reported it
2. **Use the bug report template** - Click "New Issue" → "Bug Report"
3. **Provide details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (network, Node version, OS)
   - Relevant logs or screenshots

**Note**: For security vulnerabilities, please follow our [Security Policy](.github/SECURITY.md) instead of opening a public issue.

### ✨ Suggesting Features

Have an idea to make this project better?

1. **Check existing issues** - It might already be proposed
2. **Use the feature request template** - Click "New Issue" → "Feature Request"
3. **Describe your idea**:
   - What problem does it solve?
   - How should it work?
   - Any implementation ideas?
   - Potential drawbacks or challenges?

### 💻 Contributing Code

We welcome code contributions! Here's how:

**Good First Issues**: Look for issues labeled `good-first-issue` - these are great for newcomers!

**Areas for contribution**:
- Bug fixes
- New features
- Gas optimization
- Test improvements
- Documentation
- Code refactoring

### 📝 Improving Documentation

Documentation is just as important as code!

- Fix typos or unclear explanations
- Add examples or tutorials
- Improve API documentation
- Translate documentation

### 🔒 Security Reviews

Help us keep the project secure:
- Review smart contract code
- Suggest security improvements
- Report vulnerabilities responsibly (see [SECURITY.md](.github/SECURITY.md))

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Git** for version control
- Basic understanding of Solidity and Hardhat

### Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/NFT-Marketplace-be.git
   cd NFT-Marketplace-be
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/NFT-Marketplace-be.git
   ```

### Setup Development Environment

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests to ensure everything works
npm test
```

If all tests pass, you're ready to contribute! 🎉

---

## 🔄 Development Workflow

We use **GitHub Flow** - a simple, branch-based workflow:

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
```

**Branch naming convention**:
- `feature/description` - New features (e.g., `feature/auction-support`)
- `fix/description` - Bug fixes (e.g., `fix/reentrancy-vulnerability`)
- `docs/description` - Documentation (e.g., `docs/api-guide`)
- `test/description` - Test improvements (e.g., `test/integration-tests`)
- `refactor/description` - Code refactoring (e.g., `refactor/optimize-gas`)
- `chore/description` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 2. Make Your Changes

- Write clean, readable code
- Follow the project's coding standards
- Add tests for new functionality
- Update documentation if needed
- Keep commits focused and atomic

### 3. Test Your Changes

Before committing, make sure:

```bash
# All tests pass
npm test

# Specific tests related to your changes
npx hardhat test --grep "your feature"

# Check gas usage (optional)
REPORT_GAS=true npm test

# Compile without errors
npm run compile
```

### 4. Commit Your Changes

Follow our commit message guidelines (see below):

```bash
git add .
git commit -m "feat: add auction functionality to marketplace"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit the PR

---

## 📏 Coding Standards

### Solidity Style Guide

Follow the official [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html):

**Key points**:
- **Indentation**: 4 spaces (no tabs)
- **Naming**:
  - Contracts: `PascalCase` (e.g., `NFTMarketplace`)
  - Functions: `camelCase` (e.g., `listItem`)
  - Parameters: `_camelCase` with leading underscore (e.g., `_tokenId`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FEE_PERCENT`)
  - Private/Internal: `_camelCase` (e.g., `_internalFunction`)
- **Errors**: Use custom errors (gas efficient)
- **Events**: `PascalCase` (e.g., `ItemListed`)
- **Comments**: Use NatSpec for public/external functions

**Example**:
```solidity
/// @notice Lists an NFT for sale
/// @param _nftContract Address of the NFT contract
/// @param _tokenId Token ID to list
/// @param _price Listing price in wei
function listItem(
    address _nftContract,
    uint256 _tokenId,
    uint256 _price
) external nonReentrant whenNotPaused {
    if (_price == 0) revert PriceMustBeAboveZero();
    // Implementation...
}
```

### TypeScript Style Guide

- **Strict mode**: Always enabled
- **No `any` types**: Use proper typing
- **Naming**:
  - Variables/Functions: `camelCase`
  - Interfaces/Types: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Use modern syntax**: `const`/`let`, arrow functions, async/await

**Example**:
```typescript
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

async function deployFixture() {
  const [owner, seller] = await viem.getWalletClients();
  const marketplace = await viem.deployContract("NFTMarketplace", [2n]);
  return { marketplace, owner, seller };
}

it("Should list an item successfully", async function () {
  const { marketplace, seller } = await loadFixture(deployFixture);
  // Test implementation...
});
```

---

## 📝 Commit Message Guidelines

We follow **Conventional Commits** for clear and consistent commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **chore**: Maintenance tasks (dependencies, config, etc.)
- **style**: Code style changes (formatting, no logic changes)

### Scope (Optional)

The scope specifies what part of the codebase is affected:
- `marketplace` - Main marketplace contract
- `nft` - NFT contract
- `tests` - Test files
- `docs` - Documentation
- `deps` - Dependencies

### Examples

```bash
# Good commit messages
feat(marketplace): add auction functionality
fix(tests): resolve flaky integration test
docs(readme): add deployment instructions
test(marketplace): add edge case tests for listing
refactor(nft): optimize gas usage in mint function
chore(deps): update hardhat to v2.22.5

# Bad commit messages
❌ update stuff
❌ fix bug
❌ changes
❌ WIP
```

### Rules

1. **Use imperative mood**: "add" not "added" or "adds"
2. **Keep subject line under 72 characters**
3. **Capitalize the subject line**
4. **Don't end subject with a period**
5. **Separate subject from body with a blank line**
6. **Explain what and why, not how** (in the body)

---

## 🔍 Pull Request Process

### Before Creating a PR

✅ **Checklist**:
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated (if applicable)
- [ ] Code follows style guidelines
- [ ] Commits follow commit message guidelines
- [ ] No merge conflicts with `main`
- [ ] Self-review completed

### PR Title

Use the same format as commit messages:

```
feat(marketplace): add auction support
fix(nft): resolve metadata retrieval issue
docs: update contributing guidelines
```

### PR Description

Fill out the PR template completely:
- **Description**: What does this PR do?
- **Type of change**: Feature, bug fix, docs, etc.
- **Related issues**: Link to related issues (closes #123)
- **Testing**: How was this tested?
- **Screenshots**: If applicable (UI changes)
- **Breaking changes**: Any breaking changes?
- **Checklist**: Complete all items

### Code Review Process

1. **Automated checks**: CI must pass (tests, linting)
2. **Review requested**: At least 1 reviewer will review your PR
3. **Address feedback**: Respond to comments and make requested changes
4. **Approval**: Once approved, a maintainer will merge

**Review timeline**: We aim to review PRs within 2-3 business days.

### After Your PR is Merged

1. **Delete your branch** (GitHub will prompt)
2. **Update your fork**:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```
3. **Celebrate!** 🎉 You've contributed to the project!

---

## 🧪 Testing Guidelines

### Test Coverage

We aim for **90%+ test coverage** for smart contracts.

- **All new features** must include tests
- **Bug fixes** should include regression tests
- **Critical functions** must have comprehensive test coverage

### Writing Tests

Use the **fixture pattern** for clean, reusable test setup:

```typescript
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

async function deployFixture() {
  // Setup code...
  return { marketplace, nft, owner, seller, buyer };
}

describe("Feature Name", function () {
  it("Should do something", async function () {
    const { marketplace, seller } = await loadFixture(deployFixture);
    // Test implementation...
  });
});
```

### Test Categories

Organize tests into logical categories:
- **Deployment tests**: Initial state, constructor parameters
- **Functionality tests**: Core features work correctly
- **Access control tests**: Authorization checks
- **Edge cases**: Boundary conditions, error cases
- **Integration tests**: Multiple components working together

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/NFTMarketplace.ts

# Run tests matching a pattern
npx hardhat test --grep "should list item"

# Run with gas reporting
REPORT_GAS=true npm test
```

---

## 📚 Documentation

Good documentation is essential!

### What to Document

- **Public functions**: Use NatSpec comments in Solidity
- **Complex logic**: Add inline comments explaining why
- **New features**: Update README with usage examples
- **Breaking changes**: Document in PR and update docs
- **Configuration**: Document any new environment variables

### NatSpec Format

```solidity
/// @notice Lists an NFT for sale on the marketplace
/// @dev The NFT must be approved for the marketplace contract
/// @param _nftContract The address of the NFT contract
/// @param _tokenId The token ID to list
/// @param _price The listing price in wei
/// @return success Returns true if listing successful
function listItem(
    address _nftContract,
    uint256 _tokenId,
    uint256 _price
) external returns (bool success) {
    // Implementation...
}
```

### Updating Documentation

When you:
- Add a feature → Update README
- Change API → Update API docs
- Fix a bug → Update changelog (if we have one)
- Change config → Update setup instructions

---

## 💬 Community

### Where to Ask Questions

- **GitHub Discussions**: General questions, ideas, discussions
- **GitHub Issues**: Bug reports, feature requests
- **Pull Requests**: Code-specific questions

### Communication Guidelines

- **Be respectful**: Treat everyone with respect
- **Be patient**: Maintainers are often volunteers
- **Be clear**: Provide context and details
- **Be helpful**: Help others when you can
- **Be constructive**: Focus on solutions, not problems

### Getting Help

**Stuck on something?**
1. Check existing documentation (README, this guide)
2. Search existing issues and discussions
3. Ask in GitHub Discussions
4. Be specific about your problem (error messages, what you tried, etc.)

**Want to help others?**
- Answer questions in Discussions
- Review pull requests
- Improve documentation
- Triage issues

---

## 🎯 Issue and PR Labels

We use labels to organize work:

### Priority
- `priority: critical` - Must be fixed immediately
- `priority: high` - Important, fix soon
- `priority: medium` - Fix when possible
- `priority: low` - Nice to have

### Type
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `question` - Further information requested
- `security` - Security related

### Status
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention needed
- `blocked` - Waiting on something else
- `wip` - Work in progress

### Area
- `contracts` - Smart contract related
- `tests` - Test related
- `tooling` - Build/dev tools related

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

## 🙏 Thank You!

Thank you for taking the time to contribute! Every contribution, no matter how small, helps make this project better.

**Questions?** Feel free to open an issue or discussion. We're here to help! 😊

---

**Happy Coding!** 🚀

Made with ❤️ by the NFT Marketplace community
