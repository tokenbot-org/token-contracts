# Contributing to TokenBot Contracts

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
   npm test
   npm run lint
   npm run test:coverage
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

- Use 2 spaces for indentation
- Follow Solidity style guide
- Keep functions focused and small
- Add natspec comments for contracts
- Write self-documenting code

### Testing Guidelines

- Write unit tests for all new functions
- Aim for 100% code coverage
- Test edge cases and error conditions
- Use descriptive test names
- Group related tests in describe blocks

### Security Considerations

- Never commit private keys or secrets
- Follow checks in security checklist
- Consider gas optimization
- Think about reentrancy and other attacks
- Get security review for critical changes

## Questions?

- Open an issue for bugs/features
- Join discussions for questions
- Check existing issues first

Thank you for contributing!