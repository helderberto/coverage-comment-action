# Coverage Comment Action

GitHub Action to automatically post test coverage reports as pull request comments.

## Features

- 📊 Posts formatted coverage table to PR comments
- ✅ Color-coded metrics based on configurable thresholds
- 🔄 Updates existing comment instead of creating duplicates
- 📈 Expandable detailed coverage breakdown
- ⚙️ Configurable threshold and file path

## Installation

Add this action to your workflow file (e.g., `.github/workflows/ci.yml`):

```yaml
- uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Quick Start

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage

      - name: Comment coverage
        uses: helderberto/coverage-comment-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          coverage-file: ./coverage/coverage-summary.json
          threshold: 90
```

## Configuration

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for authentication | ✅ Yes | - |
| `coverage-file` | Path to coverage-summary.json | No | `./coverage/coverage-summary.json` |
| `threshold` | Minimum coverage threshold (%) | No | `90` |
| `comment-title` | Title for the PR comment | No | `📊 Coverage Report` |

### Examples

**Basic usage (defaults):**
```yaml
- uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Custom coverage file path:**
```yaml
- uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    coverage-file: ./packages/my-package/coverage/coverage-summary.json
```

**Custom threshold (80%):**
```yaml
- uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    threshold: 80
```

**Custom comment title:**
```yaml
- uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    comment-title: '🧪 Test Coverage Results'
```

**Monorepo with multiple packages:**
```yaml
- name: Coverage for package A
  uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    coverage-file: ./packages/package-a/coverage/coverage-summary.json
    comment-title: '📊 Package A Coverage'

- name: Coverage for package B
  uses: helderberto/coverage-comment-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    coverage-file: ./packages/package-b/coverage/coverage-summary.json
    comment-title: '📊 Package B Coverage'
```

## Requirements

- Coverage file must be in JSON summary format
- Requires `pull-requests: write` permission
- Only runs on `pull_request` events

## Coverage File Format

This action expects a `coverage-summary.json` file with the following structure:

```json
{
  "total": {
    "lines": { "pct": 95.5, "covered": 191, "total": 200 },
    "statements": { "pct": 95.5, "covered": 191, "total": 200 },
    "functions": { "pct": 100, "covered": 50, "total": 50 },
    "branches": { "pct": 92.3, "covered": 48, "total": 52 }
  }
}
```

Most coverage tools (Jest, Vitest, NYC) generate this format automatically when using the `json-summary` reporter.

## Example Output

The action posts a comment on your PR that looks like this:

---

## 📊 Coverage Report

| Metric | Coverage |
|--------|----------|
| Lines | ✅ 95.5% |
| Statements | ✅ 95.5% |
| Functions | ✅ 100% |
| Branches | ⚠️ 92.3% |

**Thresholds:** 90% minimum required

---
<details>
<summary>📈 Coverage Details</summary>

```
Lines:      191/200
Statements: 191/200
Functions:  50/50
Branches:   48/52
```
</details>

---

### Icon Legend

- ✅ **Green checkmark**: Coverage meets or exceeds threshold
- ⚠️ **Warning**: Coverage is within 10% below threshold
- ❌ **Red X**: Coverage is more than 10% below threshold

## Working with Different Test Runners

### Vitest

```json
{
  "test": {
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json-summary"]
    }
  }
}
```

### Jest

```json
{
  "coverageReporters": ["text", "json-summary"]
}
```

### NYC (Istanbul)

```json
{
  "reporter": ["text", "json-summary"]
}
```

## Development

This action uses [@vercel/ncc](https://github.com/vercel/ncc) to bundle dependencies into a single file.

### Building

After making changes to `src/index.js`, run:

```bash
npm run build
```

This compiles `src/index.js` and all dependencies into `dist/index.js`. The `dist/` folder is committed to the repository (not `node_modules/`).

### Why Bundle?

- **No runtime dependencies** - `dist/index.js` contains everything
- **Faster action execution** - no `npm install` needed
- **Smaller repository** - commit bundled code, not `node_modules/`

This follows the same pattern as official GitHub actions like [actions/labeler](https://github.com/actions/labeler).

## License

MIT
