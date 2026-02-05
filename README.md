# Coverage Comment Action

GitHub Action to automatically post test coverage reports as pull request comments.

## Features

- 📊 Posts formatted coverage table to PR comments
- ✅ Color-coded metrics based on configurable thresholds
- 🔄 Updates existing comment instead of creating duplicates
- 📈 Expandable detailed coverage breakdown
- ⚙️ Configurable threshold and file path

## Usage

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

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for authentication | Yes | - |
| `coverage-file` | Path to coverage-summary.json | No | `./coverage/coverage-summary.json` |
| `threshold` | Minimum coverage threshold (%) | No | `90` |
| `comment-title` | Title for the PR comment | No | `📊 Coverage Report` |

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

The action posts a comment like this:

```markdown
## 📊 Coverage Report

| Metric | Coverage |
|--------|----------|
| Lines | ✅ 95.5% |
| Statements | ✅ 95.5% |
| Functions | ✅ 100% |
| Branches | ⚠️ 92.3% |

**Thresholds:** 90% minimum required
```

## License

MIT
