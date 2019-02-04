import { Container } from 'aurelia-dependency-injection';
import { BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';
import {
  PropertyAccessorParser,
  getAccessorExpression as parse
} from '../src/aurelia-validation';

describe('PropertyAccessorParser', () => {
  let parser: PropertyAccessorParser;

  beforeAll(() => {
    const container = new Container();
    container.registerInstance(BindingLanguage, container.get(TemplatingBindingLanguage));
    parser = container.get(PropertyAccessorParser);
  });

  it('parses properties', () => {
    expect(parser.parse('firstName')).toEqual('firstName');
    expect(parser.parse('3_letter_id')).toEqual('3_letter_id');
    expect(parser.parse('. @$# ???')).toEqual('. @$# ???');
    expect(parser.parse(42)).toEqual(42);
    expect(parser.parse((x: any) => x.firstName)).toEqual('firstName');
  });

  it('parses function bodies', () => {
    expect(parse('function(a){return a.b}')).toEqual('b');
    expect(parse('function(a){return a.b;}')).toEqual('b');
    expect(parse('function (a){return a.b;}')).toEqual('b');
    expect(parse('function(a) {return a.b;}')).toEqual('b');
    expect(parse('function (a) { return a.b; }')).toEqual('b');
    expect(parse('function (a1) { return a1.bcde; }')).toEqual('bcde');
    expect(parse('function ($a1) { return $a1.bcde; }')).toEqual('bcde');
    expect(parse('function (_) { return _.bc_de; }')).toEqual('bc_de');
    expect(parse('function (a) {"use strict"; return a.b; }')).toEqual('b');
    expect(parse('function (a) { "use strict";  return a.b; }')).toEqual('b');
    expect(parse('a=>a.b')).toEqual('b');
    expect(parse('a =>a.b')).toEqual('b');
    expect(parse('a=> a.b')).toEqual('b');
    expect(parse('a => a.b')).toEqual('b');
    expect(parse('a => a.bcde')).toEqual('bcde');
    expect(parse('_ => _.b')).toEqual('b');
    expect(parse('$ => $.b')).toEqual('b');
    expect(parse('(x) => x.name')).toEqual('name');

    // tslint:disable-next-line:max-line-length
    expect(parse('function(a){__gen$field.f[\'10\']++;__aGen$field.g[\'10\']++;return a.b;}'))
      .toEqual('b');
    // tslint:disable-next-line:max-line-length
    expect(parse('function(a){"use strict";_gen$field.f[\'10\']++;_aGen$field.g[\'10\']++;return a.b;}'))
      .toEqual('b');
  });
});
