import * as os from 'os';
import * as https from 'https';
import { c, createLogger } from './logger';

const log = createLogger('ci-env');

function toBoolean(value: any): boolean {
  if (value === true || value === 'true' || value === 1) {
    return true;
  }
  if (value === false || value === 'false' || value === 0) {
    return false;
  }
  return false;
}

function toNumber(value: any): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  return 0;
}

function toString(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString();
}

const seenVariables = {};

function logVariable(value: any, name: string): any {
  if (seenVariables[name] !== value) {
    seenVariables[name] = value;
    log(`${c.grey('process.env.')}${c.white(name)}${c.grey(':')} ${c.yellowBright(value)} (${c.grey(typeof value)})`);
  }
  return value;
}

function logSecretVariable(value: any, name: string): any {
  logVariable(`<secret, len=${value.length}>`, name);
  return value;
}

export class CIEnv {
  /**
   * true (represents whether the current environment is a CI environment)
   */
  public static get CI(): boolean {
    return logVariable(toBoolean(process.env.CI), 'CI');
  }

  /**
   * The name of the Git branch currently being built.
   */
  public static get CIRCLE_BRANCH(): string {
    return logVariable(toString(process.env.CIRCLE_BRANCH), 'CIRCLE_BRANCH');
  }

  /**
   * The number of the CircleCI build.
   */
  public static get CIRCLE_BUILD_NUM(): number {
    return logVariable(toNumber(process.env.CIRCLE_BUILD_NUM), 'CIRCLE_BUILD_NUM');
  }

  /**
   * The URL for the current build.
   */
  public static get CIRCLE_BUILD_URL(): string {
    return logVariable(toString(process.env.CIRCLE_BUILD_URL), 'CIRCLE_BUILD_URL');
  }

  /**
   * The GitHub or Bitbucket URL to compare commits of a build.
   */
  public static get CIRCLE_COMPARE_URL(): string {
    return logVariable(toString(process.env.CIRCLE_COMPARE_URL), 'CIRCLE_COMPARE_URL');
  }

  /**
   * The directory where test timing data is saved.
   */
  public static get CIRCLE_INTERNAL_TASK_DATA(): string {
    return logVariable(toString(process.env.CIRCLE_INTERNAL_TASK_DATA), 'CIRCLE_INTERNAL_TASK_DATA');
  }

  /**
   * The name of the current job.
   */
  public static get CIRCLE_JOB(): string {
    return logVariable(toString(process.env.CIRCLE_JOB), 'CIRCLE_JOB');
  }

  /**
   * The index of the specific build instance. A value between 0 and (CIRCLECI_NODE_TOTAL - 1)
   */
  public static get CIRCLE_NODE_INDEX(): number {
    return logVariable(toNumber(process.env.CIRCLE_NODE_INDEX), 'CIRCLE_NODE_INDEX');
  }

  /**
   * The number of total build instances.
   */
  public static get CIRCLE_NODE_TOTAL(): number {
    return logVariable(toNumber(process.env.CIRCLE_NODE_TOTAL), 'CIRCLE_NODE_TOTAL');
  }

  /**
   * The number of the associated GitHub or Bitbucket pull request. Only available on forked PRs.
   */
  public static get CIRCLE_PR_NUMBER(): number {
    return logVariable(toNumber(process.env.CIRCLE_PR_NUMBER), 'CIRCLE_PR_NUMBER');
  }

  /**
   * The name of the GitHub or Bitbucket repository where the pull request was created. Only available on forked PRs.
   */
  public static get CIRCLE_PR_REPONAME(): string {
    return logVariable(toString(process.env.CIRCLE_PR_REPONAME), 'CIRCLE_PR_REPONAME');
  }

  /**
   * The GitHub or Bitbucket username of the user who created the pull request. Only available on forked PRs.
   */
  public static get CIRCLE_PR_USERNAME(): string {
    return logVariable(toString(process.env.CIRCLE_PR_USERNAME), 'CIRCLE_PR_USERNAME');
  }

  /**
   * The number of previous builds on the current branch.
   */
  public static get CIRCLE_PREVIOUS_BUILD_NUM(): number {
    return logVariable(toNumber(process.env.CIRCLE_PREVIOUS_BUILD_NUM), 'CIRCLE_PREVIOUS_BUILD_NUM');
  }

  /**
   * The name of the repository of the current project.
   */
  public static get CIRCLE_PROJECT_REPONAME(): string {
    return logVariable(toString(process.env.CIRCLE_PROJECT_REPONAME), 'CIRCLE_PROJECT_REPONAME');
  }

  /**
   * The GitHub or Bitbucket username of the current project.
   */
  public static get CIRCLE_PROJECT_USERNAME(): string {
    return logVariable(toString(process.env.CIRCLE_PROJECT_USERNAME), 'CIRCLE_PROJECT_USERNAME');
  }

  /**
   * The URL of the associated pull request. If there are multiple associated pull requests, one URL is randomly chosen.
   */
  public static get CIRCLE_PULL_REQUEST(): string {
    return logVariable(toString(process.env.CIRCLE_PULL_REQUEST), 'CIRCLE_PULL_REQUEST');
  }

  /**
   * Comma-separated list of URLs of the current build’s associated pull requests.
   */
  public static get CIRCLE_PULL_REQUESTS(): string {
    return logVariable(toString(process.env.CIRCLE_PULL_REQUESTS), 'CIRCLE_PULL_REQUESTS');
  }

  /**
   * The URL of your GitHub or Bitbucket repository.
   */
  public static get CIRCLE_REPOSITORY_URL(): string {
    return logVariable(toString(process.env.CIRCLE_REPOSITORY_URL), 'CIRCLE_REPOSITORY_URL');
  }

  /**
   * The SHA1 hash of the last commit of the current build.
   */
  public static get CIRCLE_SHA1(): string {
    return logVariable(toString(process.env.CIRCLE_SHA1), 'CIRCLE_SHA1');
  }

  /**
   * The name of the git tag, if the current build is tagged. For more information, see the Git Tag Job Execution.
   */
  public static get CIRCLE_TAG(): string {
    return logVariable(toString(process.env.CIRCLE_TAG), 'CIRCLE_TAG');
  }

  /**
   * The GitHub or Bitbucket username of the user who triggered the build.
   */
  public static get CIRCLE_USERNAME(): string {
    return logVariable(toString(process.env.CIRCLE_USERNAME), 'CIRCLE_USERNAME');
  }

  /**
   * A unique identifier for the workflow instance of the current job. This identifier is the same for every job in a given workflow instance.
   */
  public static get CIRCLE_WORKFLOW_ID(): string {
    return logVariable(toString(process.env.CIRCLE_WORKFLOW_ID), 'CIRCLE_WORKFLOW_ID');
  }

  /**
   * The value of the working_directory key of the current job.
   */
  public static get CIRCLE_WORKING_DIRECTORY(): string {
    return logVariable(toString(process.env.CIRCLE_WORKING_DIRECTORY), 'CIRCLE_WORKING_DIRECTORY');
  }

  /**
   * true (represents whether the current environment is a CircleCI environment)
   */
  public static get CIRCLECI(): boolean {
    return logVariable(toBoolean(process.env.CIRCLECI), 'CIRCLECI');
  }

  /**
   * Your home directory
   */
  public static get HOME(): string {
    return logVariable(toString(process.env.HOME), 'HOME');
  }

  // custom variables
  public static get NPM_TOKEN(): string {
    return logSecretVariable(toString(process.env.NPM_TOKEN), 'NPM_TOKEN');
  }
  public static get CIRCLE_TOKEN(): string {
    return logSecretVariable(toString(process.env.CIRCLE_TOKEN), 'CIRCLE_TOKEN');
  }
  public static get GITHUB_TOKEN(): string {
    return logSecretVariable(toString(process.env.GITHUB_TOKEN), 'GITHUB_TOKEN');
  }
  public static get APP_PORT(): string {
    return logVariable(process.env.APP_PORT || '9000', 'APP_PORT');
  }
  public static get APP_HOST(): string {
    let val = process.env.APP_HOST;
    if (!val) {
      const nics = os.networkInterfaces();
      outer: for (const name in nics) {
        for (const nic of nics[name]) {
          if (nic.family !== 'IPv4' || nic.internal !== false) {
            continue;
          }
          val = nic.address;
          break outer;
        }
      }
    }
    return logVariable(val || 'localhost', 'APP_HOST');
  }

  public static async circleGet(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get({
        headers: {
          'Accept': 'application/json'
        },
        method: 'GET',
        hostname: 'circleci.com',
        path: `api/v1.1`,
        search: `circle-token=${CIEnv.CIRCLE_TOKEN}`,
      }, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });

        res.on('error', reject);
      });
    });
  }

  public static async githubPost(path: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get({
        headers: {
          'Authorization': `token ${CIEnv.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'request'
        },
        method: 'POST',
        hostname: 'api.github.com',
        path,
      }, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });

        res.on('error', reject);
      });
    });
  }
}
