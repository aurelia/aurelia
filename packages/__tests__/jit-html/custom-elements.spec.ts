import {
  Aurelia,
  bindable,
  Binding,
  customElement,
  CustomElementResource,
  InterpolationBinding,
  LifecycleFlags,
  PropertyAccessor,
  SelfObserver,
  SetterObserver
} from '@aurelia/runtime';
import { ElementPropertyAccessor } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { HTMLTestContext, TestContext, TestConfiguration, setupAndStart, tearDown } from '@aurelia/testing';

// TemplateCompiler - custom element integration
describe('custom-elements', function () {
  let ctx: HTMLTestContext;

  beforeEach(function () {
    ctx = TestContext.createHTMLTestContext();
  });

  // custom elements
  it('01.', function () {
    ctx.container.register(TestConfiguration);
    const { au, lifecycle, host } = setupAndStart(ctx, `<template><name-tag name="bigopon"></name-tag></template>`, null);

    expect(host.textContent).to.equal('bigopon');

    tearDown(au, lifecycle, host);
  });

  //[as-element]
  describe('02.', function () {

    //works with custom element with [as-element]
    it('01.', function () {
      ctx.container.register(TestConfiguration);
      const { au, lifecycle, host } = setupAndStart(ctx, `<template><div as-element="name-tag" name="bigopon"></div></template>`, null);

      expect(host.textContent).to.equal('bigopon');

      tearDown(au, lifecycle, host);
    });

    //ignores tag name
    it('02.', function () {
      ctx.container.register(TestConfiguration);
      const { au, lifecycle, host } = setupAndStart(ctx, `<template><name-tag as-element="div" name="bigopon">Fred</name-tag></template>`, null);

      expect(host.textContent).to.equal('Fred');

      tearDown(au, lifecycle, host);
    });
  });

  //<let/>
  it('03.', function () {
    const { au, lifecycle, host, component } = setupAndStart(ctx, '<template><let full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>', null);
    expect(host.textContent).to.equal('undefined undefined');

    component.firstName = 'bi';
    component.lastName = 'go';

    expect(host.textContent).to.equal('undefined undefined');

    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('bi go');

    tearDown(au, lifecycle, host);
  });

  //<let [to-view-model] />
  it('04.', function () {
    const { au, lifecycle, host, component } = setupAndStart(ctx, '<template><let to-view-model full-name.bind="firstName + ` ` + lastName"></let><div>\${fullName}</div></template>', null);
    component.firstName = 'bi';
    expect(component.fullName).to.equal('bi undefined');
    component.lastName = 'go';
    expect(component.fullName).to.equal('bi go');
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('bi go');
    tearDown(au, lifecycle, host);
  });

  //initial values propagate through multiple nested custom elements connected via bindables
  it('05.', function () {
    let boundCalls = 0;

    @customElement({ name: 'foo1', template: `<template><foo2 value.bind="value" value2.bind="value1"></foo2>\${value}</template>` })
    class Foo1 {
      @bindable()
      public value: any;
      public value1: any;
      public bound(): void {
        expect(this.value).to.equal('w00t', 'Foo1.this.value');
        expect(this.value1).to.equal('w00t1', 'Foo1.this.value1');
        boundCalls++;
      }
      public valueChanged(newValue: any): void {
        this.value1 = `${newValue}1`;
      }
    }

    @customElement({ name: 'foo2', template: `<template><foo3 value.bind="value" value2.bind="value2"></foo3>\${value}</template>` })
    class Foo2 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      public bound(): void {
        expect(this.value).to.equal('w00t', 'Foo2.this.value');
        expect(this.value1).to.equal('w00t1', 'Foo2.this.value1');
        expect(this.value2).to.equal('w00t1', 'Foo2.this.value2');
        boundCalls++;
      }
      public valueChanged(newValue: any): void {
        this.value1 = `${newValue}1`;
      }
    }

    @customElement({ name: 'foo3', template: `<template><foo4 value.bind="value" value2.bind="value2"></foo4>\${value}</template>` })
    class Foo3 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      public bound(): void {
        expect(this.value).to.equal('w00t', 'Foo3.this.value');
        expect(this.value1).to.equal('w00t1', 'Foo3.this.value1');
        expect(this.value2).to.equal('w00t1', 'Foo3.this.value2');
        boundCalls++;
      }
      public valueChanged(newValue: any): void {
        this.value1 = `${newValue}1`;
      }
    }

    @customElement({ name: 'foo4', template: `<template><foo5 value.bind="value" value2.bind="value2"></foo5>\${value}</template>` })
    class Foo4 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      public bound(): void {
        expect(this.value).to.equal('w00t', 'Foo4.this.value');
        expect(this.value1).to.equal('w00t1', 'Foo4.this.value1');
        expect(this.value2).to.equal('w00t1', 'Foo4.this.value2');
        boundCalls++;
      }
      public valueChanged(newValue: any): void {
        this.value1 = `${newValue}1`;
      }
    }

    @customElement({ name: 'foo5', template: `<template>\${value}</template>` })
    class Foo5 {
      @bindable()
      public value: any;
      public value1: any;
      @bindable()
      public value2: any;
      public bound(): void {
        expect(this.value).to.equal('w00t', 'Foo5.this.value');
        expect(this.value1).to.equal('w00t1', 'Foo5.this.value1');
        expect(this.value2).to.equal('w00t1', 'Foo5.this.value2');
        boundCalls++;
      }
      public valueChanged(newValue: any): void {
        this.value1 = `${newValue}1`;
      }
    }

    const customElementCtors: any[] = [Foo1, Foo2, Foo3, Foo4, Foo5];
    const { container, lifecycle } = ctx;
    container.register(...customElementCtors);
    container.register(TestConfiguration);
    const host = ctx.createElement('app');
    const au = new Aurelia(container);
    const App = CustomElementResource.define({ name: 'app', template: '<template><foo1 value.bind="value"></foo1>\${value}</template>' }, null);
    const component = new App();
    component.value = 'w00t';
    au.app({ host, component }).start();

    expect(boundCalls).to.equal(5);

    let i = 0;
    let current = component;
    let cur: any;
    while (i < 5) {
      const childCtor = customElementCtors[i];
      expect(current.$componentHead).to.be.a('object');
      expect(current.$componentHead).to.equal(current.$componentTail);
      expect(current.$componentHead).to.be.instanceof(childCtor);

      switch (i) {
        case 0: // root component -> foo1
          cur = current.$bindingHead;
          expect(cur).to.be.instanceof(Binding);
          expect(cur._observer0).be.instanceof(SetterObserver);
          expect(cur._observer1).to.equal(undefined);
          expect(cur.targetObserver).to.be.instanceof(PropertyAccessor);

          cur = cur.$nextBinding;
          expect(cur).to.be.instanceof(InterpolationBinding);
          expect(cur.target.nodeName).to.equal('#text');
          expect(cur.targetObserver).to.be.instanceof(ElementPropertyAccessor);
          expect(cur.$nextBinding).to.equal(null, 'cur.$nextBinding');

          cur = current = current.$componentHead;
          expect(cur).to.be.instanceof(childCtor, `cur.$componentHead ${i}`);
          break;
        case 1: // foo1 -> foo2
          cur = current.$bindingHead;
          expect(cur).to.be.instanceof(Binding);
          expect(cur._observer0).be.instanceof(SelfObserver);
          expect(cur._observer1).to.equal(undefined);
          expect(cur.targetObserver).to.be.instanceof(PropertyAccessor);

          cur = cur.$nextBinding;
          expect(cur).to.be.instanceof(Binding);
          expect(cur._observer0).be.instanceof(SetterObserver);
          expect(cur._observer1).to.equal(undefined);
          expect(cur.targetObserver).to.be.instanceof(PropertyAccessor);

          cur = cur.$nextBinding;
          expect(cur).to.be.instanceof(InterpolationBinding);
          expect(cur.target.nodeName).to.equal('#text');
          expect(cur.targetObserver).to.be.instanceof(ElementPropertyAccessor);
          expect(cur.$nextBinding).to.equal(null, 'cur.$nextBinding');

          cur = current = current.$componentHead;
          expect(cur).to.be.instanceof(childCtor, `cur.$componentHead ${i}`);
          break;
        case 2:
        case 3:
        case 4: // foo2 -> foo3-5
          cur = current.$bindingHead;
          expect(cur).to.be.instanceof(Binding);
          expect(cur._observer0).be.instanceof(SelfObserver);
          expect(cur._observer1).to.equal(undefined);
          expect(cur.targetObserver).to.be.instanceof(PropertyAccessor);

          cur = cur.$nextBinding;
          expect(cur).to.be.instanceof(Binding);
          expect(cur._observer0).be.instanceof(SelfObserver);
          expect(cur._observer1).to.equal(undefined);
          expect(cur.targetObserver).to.be.instanceof(PropertyAccessor);

          cur = cur.$nextBinding;
          expect(cur).to.be.instanceof(InterpolationBinding);
          expect(cur.target.nodeName).to.equal('#text');
          expect(cur.targetObserver).to.be.instanceof(ElementPropertyAccessor);
          expect(cur.$nextBinding).to.equal(null, 'cur.$nextBinding');

          cur = current = current.$componentHead;
          expect(cur).to.be.instanceof(childCtor, `cur.$componentHead ${i}`);
      }

      i++;
    }

    expect(lifecycle['flushCount']).to.equal(0);
    expect(host.textContent).to.equal('w00t'.repeat(6));

    component.value = 'w00t00t';
    expect(current.value).to.equal('w00t00t');
    expect(host.textContent).to.equal('w00t'.repeat(6));
    expect(lifecycle['flushCount']).to.equal(6);

    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('w00t00t'.repeat(6));
    tearDown(au, lifecycle, host);
  });
});
