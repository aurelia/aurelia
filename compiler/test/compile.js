const { NodeFileUtils } = require('./node-file-utils');
const { AureliaCompiler, Parser } = require('../dist/aurelia-compiler');

console.time('Compilation');
(async () => {
  try {
    let compiler = new AureliaCompiler(new NodeFileUtils());
    compiler.start('src/app.au');
    // console.log({ factory: factory.templateFactories[0].dependencies });
    // require('fs').writeFileSync('src/app.au.js', mainModule.toString(), 'utf-8');
    await compiler.emitAll();
    require('fs').writeFileSync('src/asts.js', Parser.generateAst(), 'utf-8');
    console.timeEnd('Compilation');
  } catch (ex) {
    console.log(ex);
  }
})();
