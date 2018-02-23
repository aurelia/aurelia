const { Au } = require('../dist/aurelia-compiler');

let factory = new Au().compile(`
  <div class.bind="five ? 'five' : ''">
    <span>Test</span>
  </div>
`);

console.log('factory Html:\n', factory.html);
console.log('factory bindings:', JSON.stringify(factory.bindings));

factory = new Au().parseFile('src/app.au');
