# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in TokenBot contracts, please report it responsibly.

### How to Report

- **Email**: security@tokenbot.com
- **Response Time**: Within 24 hours
- **Encryption**: PGP key available on request for sensitive reports

### What to Include

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and affected components
3. **Reproduction**: Steps to reproduce the issue
4. **Proof of Concept**: Code or transaction examples if applicable
5. **Suggested Fix**: If you have recommendations

### What to Expect

1. **Acknowledgment**: We'll confirm receipt within 24 hours
2. **Assessment**: Initial assessment within 48 hours
3. **Updates**: Regular updates on investigation progress
4. **Resolution**: Fix deployment and public disclosure coordination

### Security Documentation

For comprehensive security information, see:

- [Security Overview](./docs/security/SECURITY.md)
- [Threat Model](./docs/security/THREAT_MODEL.md)
- [Security Checklist](./docs/security/SECURITY_CHECKLIST.md)
- [Security Testing](./docs/security/SECURITY_TESTING.md)

### Bug Bounty Program

🔄 **Coming Soon**: We're planning to launch a bug bounty program with rewards up to $10,000 based on severity.

### Responsible Disclosure

We follow coordinated disclosure principles:

- **No Public Disclosure**: Until we've had time to investigate and fix
- **Credit**: We'll acknowledge security researchers (with permission)
- **Timeline**: Typically 90 days for disclosure after fix deployment

### Security Features

- **Pausable**: Emergency stop functionality
- **Access Control**: Owner-only administrative functions
- **Bridge Security**: Uses audited Base native bridge
- **No Upgrades**: Immutable contracts for transparency
- **OpenZeppelin**: Battle-tested security libraries

### Out of Scope

The following are generally out of scope:
- Issues in third-party dependencies (report to respective projects)
- Social engineering attacks
- Physical attacks on infrastructure
- Issues requiring significant social engineering
- Self-XSS attacks

### Contact

For questions about this security policy:
- **General**: security@tokenbot.com
- **Community**: [GitHub Discussions](https://github.com/tokenbot-org/tokenbot-contracts/discussions)