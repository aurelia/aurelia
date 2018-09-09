import { CIEnv } from './ci-env';

async function main() {
  let url;
  const rows = await CIEnv.circleGet(`project/github/aurelia/aurelia/${CIEnv.CIRCLE_BUILD_NUM}/artifacts`);
  for (const row of rows) {
    if (row.url.endsWith('allure-report/index.html')) {
      url = row.url;
      break;
    }
  }

  const resp = await CIEnv.githubPost(`repos/aurelia/aurelia/issues/${CIEnv.CIRCLE_PULL_REQUEST.split('/').pop()}/comments`, {
    body: `Allure Report: ${url}`
  });
}

try {
  main();
} catch(e) {}
