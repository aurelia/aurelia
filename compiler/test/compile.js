const { AureliaCompiler, Parser } = require('../dist/aurelia-compiler');

console.time('Compilation');
let mainModule = new AureliaCompiler().start('src/app.au');
// console.log({ factory: factory.templateFactories[0].dependencies });
require('fs').writeFileSync('src/app.au.js', mainModule.toString(), 'utf-8');
require('fs').writeFileSync('src/asts.js', Parser.generateAst(), 'utf-8');
console.timeEnd('Compilation');
