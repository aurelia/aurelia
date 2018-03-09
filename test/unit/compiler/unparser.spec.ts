// TODO: This test fails

// import { Container } from 'aurelia-dependency-injection';
// import { Parser } from '../../../compiler/parser';

// describe('Unparser', () => {
//   let parser;

//   beforeAll(() => {
//     let container = new Container();
//     parser = container.get(Parser);
//   });

//   it('should unparse', () => {
//     let expressions = [
//       'foo|bar:a|baz:b:c&bap:d&bop:e:f',
//       'foo&bar:baz',
//       'foo|bar:baz',
//       'foo()',
//       'foo(bar,baz)',
//       'foo.bar.baz',
//       `{'a':b,'c':d,'e':f}`,
//       '[a,b,c]',
//       'foo'
//     ];
//     let i = expressions.length;
//     while (i--) {
//       let expression = expressions[i];
//       expect(parser.parse(expression).toString()).toBe(expression);
//     }
//   });
// });
