import { NPM } from 'aurelia-cli';
import * as kill from 'tree-kill';

const npm =  new NPM();

const run = () => {
  console.log('`au run` is an alias of the `npm start`, you may use either of those; see README for more details.');
  const args = process.argv.slice(3);
  return npm.run('start', ['--', ...args]);
}

const shutdownAppServer = () => {
  if (npm && npm.proc) {
    kill(npm.proc.pid);
  }
};

export { run as default, shutdownAppServer };
