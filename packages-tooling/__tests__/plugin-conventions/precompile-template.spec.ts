// import { precompileTemplate, generateCodeFromDefinition } from '@aurelia/plugin-conventions';
// import * as assert from 'assert';

// describe('plugin-conventions/precompile-template.spec.ts', function () {
//   it('compiles basic element', function () {
//     assert.deepStrictEqual(
//       precompileTemplate('<div></div>'),
//       {
//         template: '<div></div>',
//         instructions: []
//       }
//     );
//   });

//   it('outputs concise void tag', function () {
//     assert.deepStrictEqual(
//       precompileTemplate('<input><img>'),
//       {
//         template: '<input><img>',
//         instructions: []
//       }
//     );
//   });

//   it('compiles one binding', function () {
//     assert.deepStrictEqual(
//       precompileTemplate('<div class.bind="klass">'),
//       {
//         template: '<div class="au"></div>',
//         instructions: [
//           { type: 'b', from: 'klass', to: 'class' }
//         ]
//       }
//     );
//   });

//   it('compiles two bindings', function () {
//     assert.deepStrictEqual(
//       precompileTemplate('<input value.bind="v" disabled.bind="d">'),
//       {
//         template: '<input class="au">',
//         instructions: [
//           { type: 'b', from: 'v', to: 'value' },
//           { type: 'b', from: 'd', to: 'disabled' },
//         ]
//       }
//     );
//   });

//   it.skip('compiles basic template compiler', function () {
//     assert.deepStrictEqual(
//       precompileTemplate('<div if.bind="condition">'),
//       {
//         template: '<au-m class="au"></au-m>',
//         instructions: [
//           { type: 'tc', from: 'condition', to: 'value', klass: `{If}`, definition: {
//             template: '<div></div>',
//             instructions: []
//           }}
//         ]
//       }
//     );
//   });

//   describe('generateCodeFromDefinition', function () {
//     it('generates empty definition', function () {
//       const code = generateCodeFromDefinition({
//         template: '',
//         instructions: []
//       });
//       assert.strictEqual(code, `
// const __$au_partialDefinition__ = {
//   template: "",
//   instructions: [],
//   needsCompile: false,
// };
//       `.trim());
//     });

//     it('generates definition with binding', function () {
//       const code = generateCodeFromDefinition({
//         template: '',
//         instructions: [{ type: 'b', from: 'value', to: 'value' }]
//       });
//       assert.strictEqual(code, `
// const __$au_partialDefinition__ = {
//   template: "",
//   instructions: [${JSON.stringify({ type: "b", from: "value", to: "value" })}],
//   needsCompile: false,
// };
//       `.trim());
//     });

//     it.skip('generates definition with custom element', function () {
//       const code = generateCodeFromDefinition({
//         template: '<au-compose></au-compose>',
//         instructions: [{ type: 'ce', klass: '{AuCompose}' }]
//       });
//       assert.strictEqual(code, `
// import { CustomElement as $AUCE, AuCompose } from '@aurelia/runtime-html';

// const __$au_partialDefinition__ = {
//   template: "<au-compose class="au"></au-compose>",
//   instructions: [{ type: "ce", type: $AUCE.getDefinition(AuCompose) }],
//   needsCompile: false,
// };
//       `.trim());
//     });
//   });
// });
