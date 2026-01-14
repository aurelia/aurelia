const { getInfo, getInfoFromPullRequest } = require('@changesets/get-github-info');

function readEnv() {
  return {
    GITHUB_SERVER_URL: process.env.GITHUB_SERVER_URL || 'https://github.com'
  };
}

function stripSummaryMetadata(summary) {
  let prFromSummary;
  let commitFromSummary;

  const cleaned = summary
    .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
      const num = Number(pr);
      if (!Number.isNaN(num)) prFromSummary = num;
      return '';
    })
    .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
      commitFromSummary = commit;
      return '';
    })
    // Ignore author/user metadata so we prefer the PR author.
    .replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, () => '')
    .trim();

  return { cleaned, prFromSummary, commitFromSummary };
}

async function getReleaseLine(changeset, _type, options) {
  if (!options || !options.repo) {
    throw new Error('Please provide a repo to this changelog generator like this:\n"changelog": ["./changelog.cjs", { "repo": "org/repo" }]');
  }

  const { cleaned, prFromSummary, commitFromSummary } = stripSummaryMetadata(changeset.summary);
  const [firstLine, ...futureLines] = cleaned.split('\n').map(l => l.trimRight());
  const { GITHUB_SERVER_URL } = readEnv();

  let links = { commit: null, pull: null, user: null };

  if (prFromSummary !== undefined) {
    const info = await getInfoFromPullRequest({ repo: options.repo, pull: prFromSummary });
    links = info.links;
    if (commitFromSummary) {
      const shortCommitId = commitFromSummary.slice(0, 7);
      links = {
        ...links,
        commit: `[\`${shortCommitId}\`](${GITHUB_SERVER_URL}/${options.repo}/commit/${commitFromSummary})`
      };
    }
  } else {
    const commitToFetchFrom = commitFromSummary || changeset.commit;
    if (commitToFetchFrom) {
      const info = await getInfo({ repo: options.repo, commit: commitToFetchFrom });
      links = info.links;
    }
  }

  const prefix = [
    links.pull === null ? '' : ` ${links.pull}`,
    links.commit === null ? '' : ` ${links.commit}`,
    links.user === null ? '' : ` Thanks ${links.user}!`
  ].join('');

  return `\n\n-${prefix ? `${prefix} -` : ''} ${firstLine}\n${futureLines.map(l => `  ${l}`).join('\n')}`;
}

function getDependencyReleaseLine() {
  return '';
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine
};
