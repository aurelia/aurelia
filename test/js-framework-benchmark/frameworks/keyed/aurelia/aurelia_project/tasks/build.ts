import { NPM } from 'aurelia-cli';

export default function() {
  console.log('`au build` is an alias of the `npm run build`, you may use either of those; see README for more details.');

  const args = process.argv.slice(3);
  return (new NPM()).run('run', ['build', '--', ...args]);
}
