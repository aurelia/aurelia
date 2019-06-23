import { exec } from 'child_process';

export async function getGitLog(fromRevision: string, toRevision: string, path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(`git log ${fromRevision}..${toRevision} -- ${path}`, (err, stdout, _stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout);
    });
  });
}

export async function git(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(`git ${command}`, (err, stdout, _stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout);
    });
  });
}
