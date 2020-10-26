const { execSync } = require('child_process');

for (const appPath of [
  '1kcomponents',
  'fractals-tree',
  'sierpinski-triangle,'
]) {
  execSync(`cd ${appPath} && npm run build`);
}
