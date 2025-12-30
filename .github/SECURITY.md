# Security Policy

## 🔒 Reporting a Vulnerability

If you discover a security vulnerability in this project, please help us by reporting it responsibly.

### How to Report

**Please DO NOT:**
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it's been addressed
- Exploit the vulnerability

**Please DO:**
- Email us at: **[security report - open a GitHub issue with "SECURITY:" prefix]**
- Provide detailed information about the vulnerability
- Include steps to reproduce if possible
- Allow reasonable time for us to address the issue

### What to Expect

- We will acknowledge your report within **48-72 hours**
- We will investigate and provide updates on our progress
- We will credit you (if desired) once the vulnerability is fixed
- For valid reports, we deeply appreciate your responsible disclosure

## 🛡️ Security Status

**Current Status:** 🚧 In Active Development

- ⚠️ This contract has **NOT been professionally audited**
- ✅ Comprehensive test suite with 90%+ coverage
- ✅ Implements security best practices (ReentrancyGuard, Ownable, Pausable)
- ⚠️ **NOT recommended for mainnet deployment** without audit

## 📋 Security Best Practices

When working with this codebase:

1. **Never commit sensitive data:**
   - Private keys, seed phrases, or mnemonics
   - `.env` files (already in `.gitignore`)
   - API keys or secrets

2. **Always test on testnet first:**
   - Use Sepolia or Hardhat local network
   - Never test with real funds initially

3. **Use hardware wallets for production:**
   - Ledger or Trezor for mainnet deployments
   - Separate wallets for dev/test/production

## 🙏 Thank You

We appreciate security researchers and contributors who help keep this project safe!
