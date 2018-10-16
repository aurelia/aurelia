import { expect } from "chai";
import { tearDown, createCustomElement, setupAndStart, TestConfiguration, cleanup } from "./prepare";
import { customElement, bindable, IChangeSet, Aurelia, Binding, SetterObserver, PropertyAccessor, ElementPropertyAccessor, Observer } from "@aurelia/runtime";
import { DI } from "@aurelia/kernel";
import { BasicConfiguration } from "../../src";
import { h } from "./util";
import { InterpolationBinding } from "../../../runtime/src/binding/interpolation-binding";

// TemplateCompiler - custom element integration
describe('template-compiler.custom-elements', () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  // custom elements
  it('01.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><name-tag name="bigopon"></name-tag></template>`, null);

    expect(host.textContent).to.equal('bigopon');

    tearDown(au, cs, host);
  });

  //[as-element]
  describe('02.', () => {

    //works with custom element with [as-element]
    it('01.', () => {
      const { au, host, cs, component } = setupAndStart(`<template><div as-element="name-tag" name="bigopon"></div></template>`, null);

      expect(host.textContent).to.equal('bigopon');

      tearDown(au, cs, host);
    });

    //ignores tag name
    it('02.', () => {
      const { au, host, cs, component } = setupAndStart(`<template><name-tag as-element="div" name="bigopon">Fred</name-tag></template>`, null);

      expect(host.textContent).to.equal('Fred');

      tearDown(au, cs, host);
    });
  });

  //<let/>
  it('03.', () => {
    const { au, host, cs, component } = setupAndStart('<template><let full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>', null);
    expect(host.textContent).to.equal('undefined undefined');

    component.firstName = 'bi';
    component.lastName = 'go';

    expect(host.textContent).to.equal('undefined undefined');

    cs.flushChanges();

    expect(host.textContent).to.equal('bi go');

    tearDown(au, cs, host);
  });

  //<let [to-view-model] />
  it('04.', () => {
    const { au, host, cs, component } = setupAndStart('<template><let to-view-model full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>', null);
    component.firstName = 'bi';
    expect(component.fullName).to.equal('bi undefined');
    component.lastName = 'go';
    expect(component.fullName).to.equal('bi go');
    cs.flushChanges();
    expect(host.textContent).to.equal('bi go');
    tearDown(au, cs, host);
  });

  //initial values propagate through multiple nested custom elements connected via bindables
  it('05.', () => {
    const build = { required: true, compiler: 'default' };
    let boundCalls = 0;

    @customElement({ name: 'foo1', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>`, instructions: [], build })
    class Foo1 {
      @bindable()
      public value: any;
      public value1: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo2', template: `<template><foo3 value.bind="value" value2.bind="value2"></foo3>\${value}</template>`, instructions: [], build })
    class Foo2 {
      @bindable()
      public value: any;
      public value1: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      @bindable()
      public value2: any;
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo3', template: `<template><foo4 value.bind="value" value2.bind="value2"></foo4>\${value}</template>`, instructions: [], build })
    class Foo3 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo4', template: `<template><foo5 value.bind="value" value2.bind="value2"></foo5>\${value}</template>`, instructions: [], build })
    class Foo4 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    @customElement({ name: 'foo5', template: `<template>\${value}</template>`, instructions: [], build })
    class Foo5 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      private valueChanged(newValue: any): void {
        this.value1 = newValue+'1';
      }
      public bound(): void {
        expect(this.value).to.equal('w00t');
        expect(this.value1).to.equal('w00t1');
        expect(this.value2).to.equal('w00t1');
        boundCalls++;
      }
    }

    const customElementCtors: any[] = [Foo1, Foo2, Foo3, Foo4, Foo5];
    const container = DI.createContainer();
    container.register(...customElementCtors);
    const cs = container.get<IChangeSet>(IChangeSet);
    container.register(TestConfiguration, BasicConfiguration)
    const host = document.createElement('app');
    document.body.appendChild(host);
    const au = new Aurelia(container);
    const component = createCustomElement('<template><foo1 value.bind="value"></foo1>\${value}</template>', null);
    component.value = 'w00t';
    au.app({ host, component }).start();

    expect(boundCalls).to.equal(5);

    let i = 0;
    let current = component;
    while (i < 5) {
      const childCtor = customElementCtors[i];
      expect(current.$attachables.length).to.equal(1);
      expect(current.$attachables[0]).to.be.instanceof(childCtor);

      switch (i) {
        case 0: // root component -> foo1
          expect(current.$bindables.length).to.equal(3);
          expect(current.$bindables[0]).to.be.instanceof(Binding);
          expect(current.$bindables[0]._observer0).be.instanceof(SetterObserver);
          expect(current.$bindables[0]._observer1).to.be.undefined;
          expect(current.$bindables[0].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[1]).to.be.instanceof(childCtor);

          expect(current.$bindables[2]).to.be.instanceof(InterpolationBinding);
          expect(current.$bindables[2].target.nodeName).to.equal('#text');
          expect(current.$bindables[2].targetObserver).to.be.instanceof(ElementPropertyAccessor);
          current = current.$bindables[1];
          break;
        case 1: // foo1 -> foo2
          expect(current.$bindables.length).to.equal(4);
          expect(current.$bindables[0]).to.be.instanceof(Binding);
          expect(current.$bindables[0]._observer0).be.instanceof(Observer);
          expect(current.$bindables[0]._observer1).to.be.undefined;
          expect(current.$bindables[0].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[1]).to.be.instanceof(Binding);
          expect(current.$bindables[1]._observer0).be.instanceof(SetterObserver);
          expect(current.$bindables[1]._observer1).to.be.undefined;
          expect(current.$bindables[1].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[2]).to.be.instanceof(childCtor);
          expect(current.$bindables[3]).to.be.instanceof(InterpolationBinding);
          expect(current.$bindables[3].target.nodeName).to.equal('#text');
          expect(current.$bindables[3].targetObserver).to.be.instanceof(ElementPropertyAccessor);
          current = current.$bindables[2];
          break;
        case 2:
        case 3:
        case 4: // foo2 -> foo3-5
          expect(current.$bindables.length).to.equal(4);
          expect(current.$bindables[0]).to.be.instanceof(Binding);
          expect(current.$bindables[0]._observer0).be.instanceof(Observer);
          expect(current.$bindables[0]._observer1).to.be.undefined;
          expect(current.$bindables[0].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[1]).to.be.instanceof(Binding);
          expect(current.$bindables[1]._observer0).be.instanceof(Observer);
          expect(current.$bindables[1]._observer1).to.be.undefined;
          expect(current.$bindables[1].targetObserver).to.be.instanceof(PropertyAccessor);

          expect(current.$bindables[2]).to.be.instanceof(childCtor);
          expect(current.$bindables[3]).to.be.instanceof(InterpolationBinding);
          expect(current.$bindables[3].target.nodeName).to.equal('#text');
          expect(current.$bindables[3].targetObserver).to.be.instanceof(ElementPropertyAccessor);
          current = current.$bindables[2];
      }

      i++;
    }

    expect(cs.size).to.equal(0);
    expect(host.textContent).to.equal('w00t'.repeat(6));

    component.value = 'w00t00t';
    expect(current.value).to.equal('w00t00t');
    expect(host.textContent).to.equal('w00t'.repeat(6));
    expect(cs.size).to.equal(6);

    cs.flushChanges();
    expect(host.textContent).to.equal('w00t00t'.repeat(6));
    tearDown(au, cs, host);
  });

  function template(attrs: Record<string, any> | null, ...children: Element[]) {
    return h('template', attrs, ...children);
  }

  function select(attrs: Record<string, any> | null, ...children: (HTMLOptionElement | HTMLOptGroupElement)[]) {
    return h('select', attrs, ...children);
  }

  function option(attrs: Record<string, any> | null) {
    return h('option', attrs);
  }
});
