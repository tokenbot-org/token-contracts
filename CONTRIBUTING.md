# 🤝 Contributing to TokenBot Contracts

Welcome! We're excited you're interested in contributing to the TokenBot token contracts. This guide will help you get started.

## Development Workflow

We use a Git Flow-inspired workflow with `develop` as the default branch for ongoing development.

### Branch Structure

- **`main`** - Production-ready code, deployed contracts
- **`develop`** - Default branch for development, all PRs merge here first
- **`feature/*`** - New features and enhancements
- **`bugfix/*`** - Bug fixes
- **`hotfix/*`** - Emergency fixes to production

### Pull Request Process

1. **Create a feature branch from `develop`**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add/update tests as needed
   - Follow existing code style

3. **Run tests and linting**

   ```bash
   npm test              # Run all 78 tests
   npm run lint          # Check code style
   npm run lint:fix      # Auto-fix issues
   npm run test:coverage # Ensure 100% coverage
   npm run test:gas      # Check gas usage
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions/changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

5. **Push to GitHub**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to [GitHub](https://github.com/tokenbot-org/token-contracts)
   - Click "Compare & pull request"
   - Base: `develop` ← Compare: `feature/your-feature-name`
   - Fill out the PR template
   - Request reviews if needed

### PR Requirements

Before merging, all PRs must:

- ✅ Pass all CI checks (tests, linting, security)
- ✅ Have at least one approval (for external contributors)
- ✅ Be up to date with `develop` branch
- ✅ Include tests for new functionality
- ✅ Update documentation if needed

### Release Process

1. When `develop` is ready for release:

   ```bash
   git checkout main
   git merge develop
   git tag v1.0.0
   git push origin main --tags
   ```

2. Deploy contracts from `main` branch

3. Create GitHub release with deployment addresses

### Setting Up Your Environment

1. **Fork the repository** (external contributors)

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/token-contracts.git
   cd token-contracts
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/tokenbot-org/token-contracts.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   npm run setup
   ```

### Keeping Your Fork Updated

```bash
git checkout develop
git fetch upstream
git merge upstream/develop
git push origin develop
```

### Code Style Guidelines

#### Solidity

- Use 2 spaces for indentation
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Keep functions focused and small
- Add NatSpec comments for all public functions
- Use explicit visibility modifiers
- Order: state variables, events, modifiers, constructor, functions

#### JavaScript/TypeScript

- Use 2 spaces for indentation
- Use ESLint configuration provided
- Prefer async/await over promises
- Use descriptive variable names
- Add JSDoc comments for complex functions

### Testing Guidelines

- Write unit tests for all new functions
- Maintain 100% code coverage (required)
- Test edge cases and error conditions
- Use descriptive test names
- Group related tests in describe blocks
- Test gas consumption for critical functions
- Include integration tests for multi-contract interactions

#### Running Tests

```bash
# Run specific test suites
npm run test:l1          # L1 contract tests
npm run test:l2          # L2 contract tests
npm run test:multichain  # Multi-chain tests

# Generate reports
npm run test:coverage    # Coverage report
npm run test:gas         # Gas usage report
```

### Security Considerations

⚠️ **Critical Security Rules**

1. **Never commit:**
   - Private keys or mnemonics
   - API keys or secrets
   - Production deployment addresses (use deployment files)

2. **Always:**
   - Run security checks: `npm run security:check`
   - Follow [Security Checklist](./docs/security/SECURITY_CHECKLIST.md)
   - Consider gas optimization
   - Check for reentrancy vulnerabilities
   - Validate all external inputs
   - Use SafeMath or Solidity 0.8+ overflow protection

3. **For critical changes:**
   - Request security review
   - Run Slither analysis
   - Consider formal verification

## Getting Help

### Resources

- 📚 [Documentation](https://docs.tokenbot.com)
- 🐛 [Report Issues](https://github.com/tokenbot-org/token-contracts/issues)
- 💬 [Discussions](https://github.com/tokenbot-org/token-contracts/discussions)
- 📧 [Email Support](mailto:dev@tokenbot.com)

### Before Opening an Issue

1. Check existing issues and discussions
2. Search the documentation
3. Try to reproduce the problem
4. Collect relevant information (versions, logs, etc.)

### Issue Templates

We provide templates for:

- 🐞 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 🔒 Security vulnerabilities (see [SECURITY.md](./.github/SECURITY.md))

## Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to TokenBot! Your efforts help make this project better for everyone.** 🚀
