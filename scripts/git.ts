import { exec } from "child_process";

export async function getGitLog(from: string, to: string, path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(`git log ${from}..${to} -- ${path}`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout);
    });
  });
}
