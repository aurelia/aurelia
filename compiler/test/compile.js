const { AureliaCompiler, Parser } = require('../dist/aurelia-compiler');

// let factory = new Au().compile(`
//   <div class.bind="five ? 'five' : ''">
//     <span>Test</span>
//   </div>
// `);

// console.log('factory Html:\n', factory.html);
// console.log('factory bindings:', JSON.stringify(factory.bindings));

console.time('Compilation');
let factory = new AureliaCompiler().start('src/app.au');
// console.log({ factory: factory.templateFactories[0].dependencies });
require('fs').writeFileSync('src/app.au.js', factory.toString(), 'utf-8');
require('fs').writeFileSync('src/asts.js', Parser.generateAst(), 'utf-8');
console.timeEnd('Compilation');
