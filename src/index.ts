import { readFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';

interface CoverageMetric {
  pct: number;
  covered: number;
  total: number;
}

interface CoverageSummary {
  total: {
    lines: CoverageMetric;
    statements: CoverageMetric;
    functions: CoverageMetric;
    branches: CoverageMetric;
  };
}

type MetricType = 'lines' | 'statements' | 'functions' | 'branches';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const coverageFile = core.getInput('coverage-file');
    const threshold = parseInt(core.getInput('threshold'), 10);
    const commentTitle = core.getInput('comment-title');

    const octokit = github.getOctokit(token);
    const context = github.context;

    if (context.eventName !== 'pull_request') {
      core.info('This action only runs on pull_request events');
      return;
    }

    if (!context.payload.pull_request) {
      core.setFailed('No pull request found in context');
      return;
    }

    const coverage: CoverageSummary = JSON.parse(readFileSync(coverageFile, 'utf-8'));
    const { total } = coverage;
    const metrics: MetricType[] = ['lines', 'statements', 'functions', 'branches'];

    const formatMetric = (metric: MetricType): string => {
      const pct = total[metric].pct;
      const icon = pct >= threshold ? '✅' : pct >= threshold - 10 ? '⚠️' : '❌';
      return `${icon} ${pct}%`;
    };

    const comment = `## ${commentTitle}

| Metric | Coverage |
|--------|----------|
| Lines | ${formatMetric('lines')} |
| Statements | ${formatMetric('statements')} |
| Functions | ${formatMetric('functions')} |
| Branches | ${formatMetric('branches')} |

**Thresholds:** ${threshold}% minimum required

---
<details>
<summary>📈 Coverage Details</summary>

\`\`\`
Lines:      ${total.lines.covered}/${total.lines.total}
Statements: ${total.statements.covered}/${total.statements.total}
Functions:  ${total.functions.covered}/${total.functions.total}
Branches:   ${total.branches.covered}/${total.branches.total}
\`\`\`
</details>`;

    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
    });

    const botComment = comments.find(
      (comment) =>
        comment.user?.type === 'Bot' &&
        comment.body?.includes(commentTitle)
    );

    if (botComment) {
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: botComment.id,
        body: comment,
      });
      core.info('Updated existing coverage comment');
    } else {
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
        body: comment,
      });
      core.info('Created new coverage comment');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

run();
