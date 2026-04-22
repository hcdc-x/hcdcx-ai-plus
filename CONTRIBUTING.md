# Contributing to HCDC-X AI+

First off, thank you for considering contributing to HCDC-X AI+! 🎉  
We welcome all kinds of contributions — from bug reports and feature suggestions to code improvements and documentation updates.

This document outlines the guidelines and best practices to help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
- [Development Workflow](#development-workflow)
  - [Fork & Clone](#fork--clone)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Testing](#testing)
  - [Pull Requests](#pull-requests)
- [Style Guides](#style-guides)
  - [JavaScript / TypeScript](#javascript--typescript)
  - [CSS / Tailwind](#css--tailwind)
  - [Documentation](#documentation)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact.hcdcx@gmail.com](mailto:contact.hcdcx@gmail.com).

---

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please:
1. **Search existing issues** – someone might have already reported it.
2. **Update to the latest version** – the bug may already be fixed.

When filing a bug report, include:
- A clear, descriptive title.
- Steps to reproduce the issue (as detailed as possible).
- Expected behavior vs. actual behavior.
- Environment details (OS, browser, Node.js version, etc.).
- Screenshots or screen recordings if applicable.

Use the **"Bug Report"** issue template.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Please:
- Use a clear, descriptive title.
- Provide a detailed description of the proposed feature.
- Explain why this enhancement would be useful to most users.
- Include any relevant examples or mockups.

Use the **"Feature Request"** issue template.

### Your First Code Contribution

Look for issues labeled **`good first issue`** or **`help wanted`** – these are specifically curated for new contributors. Feel free to ask questions in the issue comments.

---

## 🛠️ Development Workflow

### Fork & Clone

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/hcdcx-ai-plus.git
   cd hcdcx-ai-plus
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/hcdc-x/hcdcx-ai-plus.git
   ```

### Branch Naming

Create a new branch from `main` with a descriptive name:

| Type       | Branch Prefix       | Example                              |
|------------|---------------------|--------------------------------------|
| Feature    | `feature/`          | `feature/hybrid-code-generator`      |
| Bug Fix    | `fix/`              | `fix/websocket-connection-leak`      |
| Docs       | `docs/`             | `docs/api-endpoint-descriptions`     |
| Refactor   | `refactor/`         | `refactor/security-scoring-module`   |
| CI/CD      | `ci/`               | `ci/add-netlify-deploy-preview`      |

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps with automated changelogs and versioning.

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style/formatting (no logic change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies

**Examples:**
```
feat(encoder): add RGB color layer compression
fix(scanner): resolve camera permission denial on iOS
docs(readme): update deployment instructions
refactor(auth): extract JWT logic to separate service
```

### Testing

- **Backend:** Run `npm test` inside the `backend/` directory.
- **Frontend:** Run `npm test` inside the `frontend/` directory.
- **E2E:** Run `npm run test:e2e` from the project root.

Please ensure all tests pass before submitting a Pull Request. Add new tests when introducing new functionality.

### Pull Requests

1. **Sync your fork** with upstream before starting:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create your feature branch** and implement changes.

3. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** against the `main` branch of `hcdc-x/hcdcx-ai-plus`.

5. In the PR description:
   - Reference any related issues (e.g., `Closes #42`).
   - Describe what changes you made and why.
   - Include screenshots or screen recordings for UI changes.

6. A maintainer will review your PR. Address any feedback by pushing additional commits to the same branch — the PR will update automatically.

---

## 🎨 Style Guides

### JavaScript / TypeScript

- We use **Prettier** for code formatting. Configuration is in `.prettierrc`.
- **ESLint** rules are enforced. Run `npm run lint` to check your code.
- Use `const` and `let`; avoid `var`.
- Write meaningful variable and function names.
- Use async/await over raw promises where possible.
- For React components, prefer functional components with hooks.

### CSS / Tailwind

- Use Tailwind utility classes for styling. Avoid custom CSS unless absolutely necessary.
- For reusable component styles, use `@apply` directives sparingly.
- Follow the mobile-first approach.

### Documentation

- Update the `README.md` if you introduce new features or change the setup process.
- Document all public API endpoints using JSDoc comments.
- Keep comments concise and meaningful — explain "why", not "what".

---

## 👥 Community

- **GitHub Discussions:** [https://github.com/hcdc-x/hcdcx-ai-plus/discussions](https://github.com/hcdc-x/hcdcx-ai-plus/discussions)
- **Issue Tracker:** [https://github.com/hcdc-x/hcdcx-ai-plus/issues](https://github.com/hcdc-x/hcdcx-ai-plus/issues)

We appreciate every contribution, no matter how small! Thank you for helping make HCDC-X AI+ better.

---

*Happy coding! 🚀*
