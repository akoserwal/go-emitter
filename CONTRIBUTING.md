# Contributing to TypeSpec Go Emitter

We love your input! We want to make contributing to TypeSpec Go Emitter as easy and transparent as possible.

## Code Quality Standards

We maintain high code quality standards through automated tooling and manual review.

### Linting and Formatting

- **ESLint**: TypeScript code quality and security checks
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates

### Required Checks

Before submitting a PR, ensure all quality checks pass:

```bash
# Run all quality checks
npm run quality

# Individual checks
npm run lint:check    # ESLint
npm run format:check  # Prettier
npm run type-check   # TypeScript
npm test             # Jest tests
```

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Prefer explicit types over `any`
- Use functional programming patterns where appropriate

### Security

- No secrets in code or config files
- Use `eslint-plugin-security` rules
- Regular dependency updates via Dependabot
- CodeQL analysis for security vulnerabilities

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/typespec-go.git
   cd typespec-go
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Git hooks**
   ```bash
   npm run prepare
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style

3. Add tests for new functionality

4. Run quality checks:
   ```bash
   npm run quality
   ```

5. Commit with conventional commit format:
   ```bash
   git commit -m "feat: add support for generic types"
   ```

### Testing

- Write tests for all new functionality
- Maintain >70% code coverage
- Test both success and error cases
- Include integration tests for CLI functionality

```bash
# Run tests with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Generated Code Quality

When modifying the code generator:

1. Test with real TypeSpec files from `/examples`
2. Verify generated Go code compiles and passes `go vet`
3. Check that generated tests pass
4. Ensure generated documentation is helpful

```bash
# Test code generation
npm run generate
cd examples/ecommerce
go mod tidy
go test ./...
```

## Pull Request Process

### Before Submitting

- [ ] All quality checks pass (`npm run quality`)
- [ ] Tests pass with good coverage
- [ ] Examples still work
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated for user-facing changes

### PR Requirements

1. **Clear description** of what changes and why
2. **Link to issue** if applicable
3. **Screenshots/examples** for UI changes
4. **Breaking changes** clearly documented

### Review Process

1. Automated checks must pass (CI/CD pipeline)
2. Code review by maintainers
3. Manual testing of examples
4. Documentation review

## Code Architecture

### Core Components

- `simple-emitter.ts`: Main code generation logic
- `cli.ts`: Command-line interface
- `generate-docs.ts`: Documentation generation
- Configuration system for flexible output

### Adding Features

When adding new features:

1. Start with the simplest possible implementation
2. Add comprehensive tests
3. Update configuration schema if needed
4. Add examples demonstrating usage
5. Update documentation

## Reporting Issues

### Bug Reports

Use the bug report template and include:

- TypeSpec input that causes the issue
- Expected vs actual generated Go code
- Environment details (Node.js version, OS)
- Steps to reproduce

### Feature Requests

Use the feature request template and include:

- Use case and motivation
- Proposed API/configuration
- Examples of desired output
- Alternative solutions considered

## Performance Considerations

- Profile large TypeSpec files
- Minimize memory usage during parsing
- Optimize string concatenation for code generation
- Benchmark against reference implementations

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update examples when adding features
- Keep CHANGELOG.md current

## Security Guidelines

- Never commit secrets or tokens
- Use security linting rules
- Regular dependency audits
- Follow responsible disclosure for vulnerabilities

## Community

- Be respectful and inclusive
- Help newcomers get started
- Share knowledge through documentation
- Celebrate contributions of all sizes

---

Thank you for contributing to TypeSpec Go Emitter! 🚀