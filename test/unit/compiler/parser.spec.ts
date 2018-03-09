// TODO: These tests fail

// import { Parser } from '../../../compiler/parser';
// import {
//   LiteralString,
//   LiteralPrimitive,
//   LiteralObject,
//   ValueConverter,
//   BindingBehavior,
//   AccessScope,
//   AccessMember,
//   AccessKeyed,
//   CallScope,
//   CallMember,
//   CallFunction,
//   AccessThis,
//   Assign
// } from '../../../src/framework/binding/ast';

// describe('Parser', () => {
//   let parser;

//   beforeAll(() => {
//     parser = new Parser();
//   });

//   it('parses literal primitives', () => {
//     // http://es5.github.io/x7.html#x7.8.4
//     let tests = [
//       { expression: "'foo'", value: 'foo', type: LiteralString },
//       { expression: "'\\\\'", value: '\\', type: LiteralString },
//       { expression: "'\\''", value: "'", type: LiteralString },
//       { expression: "'\"'", value: '"', type: LiteralString },
//       { expression: "'\\f'", value: '\f', type: LiteralString },
//       { expression: "'\\n'", value: '\n', type: LiteralString },
//       { expression: "'\\r'", value: '\r', type: LiteralString },
//       { expression: "'\\t'", value: '\t', type: LiteralString },
//       { expression: "'\\v'", value: '\v', type: LiteralString },
//       { expression: 'true', value: true, type: LiteralPrimitive },
//       { expression: 'false', value: false, type: LiteralPrimitive },
//       { expression: 'null', value: null, type: LiteralPrimitive },
//       { expression: 'undefined', value: undefined, type: LiteralPrimitive },
//       { expression: '0', value: 0, type: LiteralPrimitive },
//       { expression: '1', value: 1, type: LiteralPrimitive },
//       { expression: '2.2', value: 2.2, type: LiteralPrimitive }
//     ];

//     for (let i = 0; i < tests.length; i++) {
//       let test = tests[i];
//       let expression = parser.parse(test.expression);
//       expect(expression instanceof test.type).toBe(true);
//       expect(expression.value).toEqual(test.value);
//     }
//   });

//   it('parses binding behaviors', () => {
//     let expression = parser.parse('foo & bar');
//     expect(expression instanceof BindingBehavior).toBe(true);
//     expect(expression.name).toBe('bar');
//     expect(expression.expression instanceof AccessScope).toBe(true);

//     expression = parser.parse('foo & bar:x:y:z & baz:a:b:c');
//     expect(expression instanceof BindingBehavior).toBe(true);
//     expect(expression.name).toBe('baz');
//     expect(expression.args).toEqual([new AccessScope('a', 0), new AccessScope('b', 0), new AccessScope('c', 0)]);
//     expect(expression.expression instanceof BindingBehavior).toBe(true);
//     expect(expression.expression.name).toBe('bar');
//     expect(expression.expression.args).toEqual([
//       new AccessScope('x', 0),
//       new AccessScope('y', 0),
//       new AccessScope('z', 0)
//     ]);
//     expect(expression.expression.expression instanceof AccessScope).toBe(true);
//   });

//   it('parses value converters', () => {
//     let expression = parser.parse('foo | bar');
//     expect(expression instanceof ValueConverter).toBe(true);
//     expect(expression.name).toBe('bar');
//     expect(expression.expression instanceof AccessScope).toBe(true);

//     expression = parser.parse('foo | bar:x:y:z | baz:a:b:c');
//     expect(expression instanceof ValueConverter).toBe(true);
//     expect(expression.name).toBe('baz');
//     expect(expression.args).toEqual([new AccessScope('a', 0), new AccessScope('b', 0), new AccessScope('c', 0)]);
//     expect(expression.expression instanceof ValueConverter).toBe(true);
//     expect(expression.expression.name).toBe('bar');
//     expect(expression.expression.args).toEqual([
//       new AccessScope('x', 0),
//       new AccessScope('y', 0),
//       new AccessScope('z', 0)
//     ]);
//     expect(expression.expression.expression instanceof AccessScope).toBe(true);
//   });

//   it('parses value converters and binding behaviors', () => {
//     let expression = parser.parse('foo | bar:x:y:z & baz:a:b:c');
//     expect(expression instanceof BindingBehavior).toBe(true);
//     expect(expression.name).toBe('baz');
//     expect(expression.args).toEqual([new AccessScope('a', 0), new AccessScope('b', 0), new AccessScope('c', 0)]);
//     expect(expression.expression instanceof ValueConverter).toBe(true);
//     expect(expression.expression.name).toBe('bar');
//     expect(expression.expression.args).toEqual([
//       new AccessScope('x', 0),
//       new AccessScope('y', 0),
//       new AccessScope('z', 0)
//     ]);
//     expect(expression.expression.expression instanceof AccessScope).toBe(true);
//   });

//   it('parses AccessScope', () => {
//     let expression = parser.parse('foo');
//     expect(expression instanceof AccessScope).toBe(true);
//     expect(expression.name).toBe('foo');
//   });

//   it('parses AccessMember', () => {
//     let expression = parser.parse('foo.bar');
//     expect(expression instanceof AccessMember).toBe(true);
//     expect(expression.name).toBe('bar');
//     expect(expression.object instanceof AccessScope).toBe(true);
//     expect(expression.object.name).toBe('foo');
//   });

//   it('parses Assign', () => {
//     let expression = parser.parse('foo = bar');
//     expect(expression instanceof Assign).toBe(true);
//     expect(expression.target instanceof AccessScope).toBe(true);
//     expect(expression.target.name).toBe('foo');
//     expect(expression.value instanceof AccessScope).toBe(true);
//     expect(expression.value.name).toBe('bar');

//     expression = parser.parse('foo = bar = baz');
//     expect(expression instanceof Assign).toBe(true);
//     expect(expression.target instanceof Assign).toBe(true);
//     expect(expression.target.target instanceof AccessScope).toBe(true);
//     expect(expression.target.target.name).toBe('foo');
//     expect(expression.target.value instanceof AccessScope).toBe(true);
//     expect(expression.target.value.name).toBe('bar');
//     expect(expression.value instanceof AccessScope).toBe(true);
//     expect(expression.value.name).toBe('baz');
//   });

//   it('parses CallScope', () => {
//     let expression = parser.parse('foo(x)');
//     expect(expression instanceof CallScope).toBe(true);
//     expect(expression.name).toBe('foo');
//     expect(expression.args).toEqual([new AccessScope('x', 0)]);
//   });

//   it('parses CallMember', () => {
//     let expression = parser.parse('foo.bar(x)');
//     expect(expression instanceof CallMember).toBe(true);
//     expect(expression.name).toBe('bar');
//     expect(expression.args).toEqual([new AccessScope('x', 0)]);
//     expect(expression.object instanceof AccessScope).toBe(true);
//     expect(expression.object.name).toBe('foo');
//   });

//   it('parses $this', () => {
//     let expression = parser.parse('$this');
//     expect(expression instanceof AccessThis).toBe(true);
//   });

//   it('translates $this.member to AccessScope', () => {
//     let expression = parser.parse('$this.foo');
//     expect(expression instanceof AccessScope).toBe(true);
//     expect(expression.name).toBe('foo');
//   });

//   it('translates $this() to CallFunction', () => {
//     let expression = parser.parse('$this()');
//     expect(expression instanceof CallFunction).toBe(true);
//     expect(expression.func instanceof AccessThis).toBe(true);
//   });

//   it('translates $this.member() to CallScope', () => {
//     let expression = parser.parse('$this.foo(x)');
//     expect(expression instanceof CallScope).toBe(true);
//     expect(expression.name).toBe('foo');
//     expect(expression.args).toEqual([new AccessScope('x', 0)]);
//   });

//   it('parses $parent', () => {
//     let s = '$parent';
//     for (let i = 1; i < 10; i++) {
//       let expression = parser.parse(s);
//       expect(expression instanceof AccessThis).toBe(true);
//       expect(expression.ancestor).toBe(i);
//       s += '.$parent';
//     }
//   });

//   it('parses $parent before value converter', () => {
//     let child = '';
//     for (let i = 1; i < 10; i++) {
//       let s = `$parent${child} | foo`;
//       let expression = parser.parse(s);
//       expect(expression instanceof ValueConverter).toBe(true);
//       expect(expression.name).toBe('foo');
//       expect(expression.expression instanceof AccessThis).toBe(true);
//       expect(expression.expression.ancestor).toBe(i);
//       child += '.$parent';
//     }
//   });

//   it('parses $parent.foo before value converter', () => {
//     let child = '';
//     for (let i = 1; i < 10; i++) {
//       let s = `$parent${child}.bar | foo`;
//       let expression = parser.parse(s);
//       expect(expression instanceof ValueConverter).toBe(true);
//       expect(expression.name).toBe('foo');
//       expect(expression.expression instanceof AccessScope).toBe(true);
//       expect(expression.expression.name).toBe('bar');
//       expect(expression.expression.ancestor).toBe(i);
//       child += '.$parent';
//     }
//   });

//   it('parses $parent before binding behavior', () => {
//     let child = '';
//     for (let i = 1; i < 10; i++) {
//       let s = `$parent${child} & foo`;
//       let expression = parser.parse(s);
//       expect(expression instanceof BindingBehavior).toBe(true);
//       expect(expression.name).toBe('foo');
//       expect(expression.expression instanceof AccessThis).toBe(true);
//       expect(expression.expression.ancestor).toBe(i);
//       child += '.$parent';
//     }
//   });

//   it('parses $parent.foo before binding behavior', () => {
//     let child = '';
//     for (let i = 1; i < 10; i++) {
//       let s = `$parent${child}.bar & foo`;
//       let expression = parser.parse(s);
//       expect(expression instanceof BindingBehavior).toBe(true);
//       expect(expression.name).toBe('foo');
//       expect(expression.expression instanceof AccessScope).toBe(true);
//       expect(expression.expression.name).toBe('bar');
//       expect(expression.expression.ancestor).toBe(i);
//       child += '.$parent';
//     }
//   });

//   it('translates $parent.foo to AccessScope', () => {
//     let s = '$parent.foo';
//     for (let i = 1; i < 10; i++) {
//       let expression = parser.parse(s);
//       expect(expression instanceof AccessScope).toBe(true);
//       expect(expression.name).toBe('foo');
//       expect(expression.ancestor).toBe(i);
//       s = '$parent.' + s;
//     }
//   });

//   it('translates $parent.foo() to CallScope', () => {
//     let s = '$parent.foo()';
//     for (let i = 1; i < 10; i++) {
//       let expression = parser.parse(s);
//       expect(expression instanceof CallScope).toBe(true);
//       expect(expression.name).toBe('foo');
//       expect(expression.ancestor).toBe(i);
//       s = '$parent.' + s;
//     }
//   });

//   it('translates $parent() to CallFunction', () => {
//     let s = '$parent()';
//     for (let i = 1; i < 10; i++) {
//       let expression = parser.parse(s);
//       expect(expression instanceof CallFunction).toBe(true);
//       expect(expression.func instanceof AccessThis).toBe(true);
//       expect(expression.func.ancestor).toBe(i);
//       s = '$parent.' + s;
//     }
//   });

//   it('translates $parent[0] to AccessKeyed', () => {
//     let s = '$parent[0]';
//     for (let i = 1; i < 10; i++) {
//       let expression = parser.parse(s);
//       expect(expression instanceof AccessKeyed).toBe(true);
//       expect(expression.object instanceof AccessThis).toBe(true);
//       expect(expression.object.ancestor).toBe(i);
//       expect(expression.key instanceof LiteralPrimitive).toBe(true);
//       expect(expression.key.value).toBe(0);
//       s = '$parent.' + s;
//     }
//   });

//   it('handles $parent inside CallMember', () => {
//     let expression = parser.parse('matcher.bind($parent)');
//     expect(expression instanceof CallMember).toBe(true);
//     expect(expression.name).toBe('bind');
//     expect(expression.args.length).toBe(1);
//     expect(expression.args[0] instanceof AccessThis).toBe(true);
//     expect(expression.args[0].ancestor).toBe(1);
//   });

//   it('parses $parent in LiteralObject', () => {
//     let expression = parser.parse('{parent: $parent}');
//     expect(expression instanceof LiteralObject).toBe(true);
//     expect(expression.keys.length).toBe(1);
//     expect(expression.keys).toEqual(['parent']);
//     expect(expression.values.length).toBe(1);
//     expect(expression.values[0] instanceof AccessThis).toBe(true);
//     expect(expression.values[0].ancestor).toBe(1);

//     expression = parser.parse('{parent: $parent, foo: bar}');
//     expect(expression instanceof LiteralObject).toBe(true);
//     expect(expression.keys.length).toBe(2);
//     expect(expression.keys).toEqual(['parent', 'foo']);
//     expect(expression.values.length).toBe(2);
//     expect(expression.values[0] instanceof AccessThis).toBe(true);
//     expect(expression.values[0].ancestor).toBe(1);
//     expect(expression.values[1] instanceof AccessScope).toBe(true);
//     expect(expression.values[1].name).toBe('bar');
//   });

//   it('parses es6 shorthand LiteralObject', () => {
//     let expression = parser.parse('{ foo, bar }');
//     expect(expression instanceof LiteralObject).toBe(true);
//     expect(expression.keys.length).toBe(2);
//     expect(expression.values.length).toBe(2);

//     expect(expression.values[0] instanceof AccessScope).toBe(true);
//     expect(expression.values[0].name).toBe('foo');
//     expect(expression.values[1] instanceof AccessScope).toBe(true);
//     expect(expression.values[1].name).toBe('bar');
//   });

//   it('does not parse invalid shorthand properties', () => {
//     let pass = false;
//     try {
//       parser.parse('{ foo.bar, bar.baz }');
//       pass = true;
//     } catch (e) {
//       pass = false;
//     }
//     expect(pass).toBe(false);

//     try {
//       parser.parse('{ "foo.bar" }');
//       pass = true;
//     } catch (e) {
//       pass = false;
//     }
//     expect(pass).toBe(false);
//   });
// });
