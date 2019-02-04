import { Container } from 'aurelia-dependency-injection';
import { BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';
import { ValidationMessageProvider } from '../src/aurelia-validation';

describe('ValidationMessageProvider', () => {
  let messageProvider: ValidationMessageProvider;

  beforeAll(() => {
    const container = new Container();
    container.registerInstance(BindingLanguage, container.get(TemplatingBindingLanguage));
    messageProvider = container.get(ValidationMessageProvider);
  });

  it('computes display name', () => {
    expect(messageProvider.getDisplayName('foo', null)).toBe('Foo');
    expect(messageProvider.getDisplayName('fooBar', null)).toBe('Foo Bar');
    expect(messageProvider.getDisplayName('foo bar', null)).toBe('Foo bar');
    expect(messageProvider.getDisplayName('foo', undefined)).toBe('Foo');
    expect(messageProvider.getDisplayName('fooBar', undefined)).toBe('Foo Bar');
    expect(messageProvider.getDisplayName('foo bar', undefined)).toBe('Foo bar');
    expect(messageProvider.getDisplayName('foo', 'hello')).toBe('hello');
    expect(messageProvider.getDisplayName('foo', () => 'hello')).toBe('hello');
  });
});
