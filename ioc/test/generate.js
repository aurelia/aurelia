const { NodeFileUtils } = require('./node-file-utils');
const { DIGenerator } = require('../dist/aurelia-ioc');

console.time('Generation');
(async () => {
  try {
    let generator = new DIGenerator(new NodeFileUtils());
    await generator.process('test/fixture');
    console.timeEnd('Generation');
  } catch (ex) {
    console.log(ex);
  }
})();
