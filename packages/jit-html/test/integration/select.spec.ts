import { Primitive } from '@aurelia/kernel';
import { LifecycleFlags as LF } from '@aurelia/runtime';
import { SelectValueObserver } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { HTMLTestContext, TestContext } from '../util';
import {
  h,
  setup,
  setupAndStart,
  tearDown
} from './util';

// TemplateCompiler - <select/> Integration
describe('select', function () {
  let ctx: HTMLTestContext;

  beforeEach(function () {
    ctx = TestContext.createHTMLTestContext();
  });

  //<select/> - single
  describe('01.', function () {

    //works with multiple toView bindings
    it('01.', function () {
      const { au, lifecycle, host, observerLocator, component } = setup(
        ctx,
        `<template>
          <select id="select1" value.to-view="selectedValue">
            <option>1</option>
            <option>2</option>
          </select>
          <select id="select2" value.to-view="selectedValue">
            <option>1</option>
            <option>2</option>
          </select>
          <select id="select3" value.to-view="selectedValue">
            <option>3</option>
            <option>4</option>
          </select>
        </template>`,
        class App {
          public selectedValue: string = '2';
        }
      );
      au.app({ host, component }).start();
      const select1: HTMLSelectElement = host.querySelector('#select1');
      const select2: HTMLSelectElement = host.querySelector('#select2');
      const select3: HTMLSelectElement = host.querySelector('#select3');
      // Inititally, <select/>s are not affected by view model values
      // expect(select1.value, `select1.value`).to.equal('1');
      // expect(select2.value, `select2.value`).to.equal('1');
      // expect(select3.value, `select3.value`).to.equal('3');
      // lifecycle.flush(LF.none);
      // after flush changes, view model value should propagate to <select/>s
      expect(select1.value, `select1.value`).to.equal('2');
      expect(select2.value, `select2.value`).to.equal('2');
      // vCurrent does not attempt to correct <select/> value
      // vNext shouldn't for compat
      expect(select3.value, `select3.value`).to.equal('3');
      const observer3 = observerLocator.getObserver(LF.none, select3, 'value') as SelectValueObserver;
      expect(observer3.currentValue, `observer3.currentValue`).to.equal('2');

      // expect no state changes after flushing
      lifecycle.processFlushQueue(LF.none);
      expect(select1.value, `select1.value`).to.equal('2');
      expect(select2.value, `select2.value`).to.equal('2');
      expect(select3.value, `select3.value`).to.equal('3');
      expect(observer3.currentValue, `observer3.currentValue`).to.equal('2');

      tearDown(au, lifecycle, host);
    });

    //works with mixed of multiple binding: twoWay + toView
    it('02.', function () {
      const { au, lifecycle, host, observerLocator, component } = setup(
        ctx,
        `<template>
          <select id="select1" value.to-view="selectedValue">
            <option>1</option>
            <option>2</option>
          </select>
          <select id="select2" value.two-way="selectedValue">
            <option>1</option>
            <option>2</option>
          </select>
          <select id="select3" value.to-view="selectedValue">
            <option>3</option>
            <option>4</option>
          </select>
        </template>`,
        class App {
          public selectedValue: string = '2';
        }
      );
      au.app({ host, component }).start();
      const select1: HTMLSelectElement = host.querySelector('#select1');
      const select2: HTMLSelectElement = host.querySelector('#select2');
      const select3: HTMLSelectElement = host.querySelector('#select3');
      //expect(component.selectedValue, `component.selectedValue`).to.equal('2');
      // Inititally, <select/>s are not affected by view model values
      // expect(select1.value, `select1.value`).to.equal('1');
      // expect(select2.value, `select2.value`).to.equal('1');
      // expect(select3.value, `select3.value`).to.equal('3');
      // lifecycle.flush(LF.none);
      expect(component.selectedValue, `component.selectedValue #1`).to.equal('2');

      // Verify observer 3 will take the view model value, regardless valid value from view model
      const observer3 = observerLocator.getObserver(LF.none, select3, 'value') as SelectValueObserver;
      expect(observer3.currentValue, `observer3.currentValue #2`).to.equal('2');

      // simulate change from under input
      select2.value = '1';
      select2.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));

      expect(component.selectedValue, `component.selectedValue #3`).to.equal('1');
      const observer1 = observerLocator.getObserver(LF.none, select1, 'value') as SelectValueObserver;
      expect(observer1.currentValue, `observer1.currentValue #4`).to.equal('1');
      // verify observer 3 will take the view model value from changes, regardless valid value from view model
      expect(observer3.currentValue, `observer3.currentValue #5`).to.equal('1');

      // expect no state changes after flushing
      lifecycle.processFlushQueue(LF.none);
      expect(component.selectedValue, `component.selectedValue #6`).to.equal('1');
      expect(observer1.currentValue, `observer1.currentValue #7`).to.equal('1');
      expect(observer3.currentValue, `observer3.currentValue #8`).to.equal('1');

      tearDown(au, lifecycle, host);
    });
  });

  //<select/> - multiple
  describe('02.', function () {

    //works with multiple toView bindings without pre-selection
    it('01.', function () {
      const { au, lifecycle, host, observerLocator, component } = setupAndStart(
        ctx,
        `<template>
          <select id="select1" multiple value.to-view="selectedValues">
            <option id="o11">1</option>
            <option id="o12">2</option>
            <option id="o13">5</option>
            <option id="o14">7</option>
          </select>
          <select id="select2" multiple value.to-view="selectedValues">
            <option id="o21">2</option>
            <option id="o22">4</option>
            <option id="o23">5</option>
            <option id="o24">6</option>
          </select>
          <select id="select3" multiple value.to-view="selectedValues">
            <option id="o31">8</option>
            <option id="o32">9</option>
            <option id="o33">10</option>
            <option id="o34">11</option>
            <option id="o35">12</option>
          </select>
        </template>`,
        class App {
          public selectedValues: Primitive[] = ['1', 2, '2', 3, '3'];
        }
      );
      const select1 = host.querySelector('#select1');
      const select2 = host.querySelector('#select2');
      const select3 = host.querySelector('#select3');
      const observer1 = observerLocator.getObserver(LF.none, select1, 'value') as SelectValueObserver;
      const observer2 = observerLocator.getObserver(LF.none, select2, 'value') as SelectValueObserver;
      const observer3 = observerLocator.getObserver(LF.none, select3, 'value') as SelectValueObserver;
      expect(observer1.currentValue, `observer1.currentValue`).to.equal(component.selectedValues);
      expect(observer2.currentValue, `observer2.currentValue`).to.equal(component.selectedValues);
      expect(observer3.currentValue, `observer3.currentValue`).to.equal(component.selectedValues);
      lifecycle.processFlushQueue(LF.none);
      const options = host.querySelectorAll('option');
      options.forEach(optionA => {
        expect(optionA.selected, `optionA.selected`).to.be[component.selectedValues.includes(optionA.value) ? 'true' : 'false'];
      });
      component.selectedValues = [];
      lifecycle.processFlushQueue(LF.none);
      options.forEach(optionB => {
        expect(optionB.selected, `optionB.selected`).to.equal(false);
      });

      // expect no state changes after flushing
      lifecycle.processFlushQueue(LF.none);
      options.forEach(optionC => {
        expect(optionC.selected, `optionC.selected`).to.equal(false);
      });

      tearDown(au, lifecycle, host);
    });

    //works with mixed of two-way + to-view bindings with pre-selection
    it('02.', function () {
      const { au, lifecycle, host, observerLocator, component } = setupAndStart(
        ctx,
        `<template>
          <select id="select1" multiple value.to-view="selectedValues">
            <option id="o11">1</option>
            <option id="o12">2</option>
            <option id="o13" selected>5</option>
            <option id="o14" selected>7</option>
          </select>
          <select id="select2" multiple value.two-way="selectedValues">
            <option id="o21">2</option>
            <option id="o22">4</option>
            <option id="o23" selected>5</option>
            <option id="o24" selected>6</option>
          </select>
          <select id="select3" multiple value.two-way="selectedValues">
            <option id="o31">8</option>
            <option id="o32">9</option>
            <option id="o33" selected>10</option>
            <option id="o34">11</option>
            <option id="o35" selected>12</option>
          </select>
        </template>`,
        class App {
          public selectedValues: Primitive[] = [];
        }
      );
      const select1: HTMLSelectElement = host.querySelector('#select1');
      const select2: HTMLSelectElement = host.querySelector('#select2');
      const select3: HTMLSelectElement = host.querySelector('#select3');
      const observer1 = observerLocator.getObserver(LF.none, select1, 'value') as SelectValueObserver;
      const observer2 = observerLocator.getObserver(LF.none, select2, 'value') as SelectValueObserver;
      const observer3 = observerLocator.getObserver(LF.none, select3, 'value') as SelectValueObserver;
      expect(observer1.currentValue, `observer1.currentValue`).to.equal(component.selectedValues);
      expect(observer2.currentValue, `observer2.currentValue`).to.equal(component.selectedValues);
      expect(observer3.currentValue, `observer3.currentValue`).to.equal(component.selectedValues);
      lifecycle.processFlushQueue(LF.none);
      const options = host.querySelectorAll('option');
      options.forEach(option1 => {
        expect(option1.selected, `option1.selected`).to.be[component.selectedValues.includes(option1.value) ? 'true' : 'false'];
      });
      component.selectedValues = [];
      lifecycle.processFlushQueue(LF.none);
      options.forEach(option2 => {
        expect(option2.selected, `option2.selected`).to.equal(false);
      });

      [].forEach.call(select3.options, (option3: HTMLOptionElement) => {
        option3.selected = true;
      });
      select3.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));
      expect(component.selectedValues.toString(), `component.selectedValues.toString()`).to.equal(['8', '9', '10', '11', '12'].toString());
      [].forEach.call(select2.options, (option4: HTMLOptionElement) => {
        option4.selected = true;
      });

      // expect no state changes after flushing
      lifecycle.processFlushQueue(LF.none);
      expect(component.selectedValues.toString(), `component.selectedValues.toString()`).to.equal(['8', '9', '10', '11', '12'].toString());
      [].forEach.call(select2.options, (option5: HTMLOptionElement) => {
        option5.selected = true;
      });

      tearDown(au, lifecycle, host);
    });
  });

  //toViewBinding - select single
  it('03.', function () {
    const { au, lifecycle, host, component } = setupAndStart(
      ctx,
      template(ctx.doc, null,
               select(ctx.doc,
                      { 'value.to-view': 'selectedValue' },
                      ...[1, 2].map(v => option(ctx.doc, { value: v }))
        )
      ),
      null
    );
    expect(host.firstElementChild['value'], `host.firstElementChild['value']`).to.equal('1');
    component.selectedValue = '2';
    expect(host.firstElementChild['value'], `host.firstElementChild['value']`).to.equal('1');
    lifecycle.processFlushQueue(LF.none);
    expect(host.firstElementChild['value'], `host.firstElementChild['value']`).to.equal('2');
    expect(host.firstElementChild.childNodes.item(1)['selected'], `host.firstElementChild.childNodes.item(1)['selected']`).to.equal(true);
    tearDown(au, lifecycle, host);
  });

  //twoWayBinding - select single
  it('04.', function () {
    const { au, lifecycle, host, component } = setupAndStart(
      ctx,
      h(ctx.doc, 'template',
        null,
        h(ctx.doc, 'select',
          { 'value.two-way': 'selectedValue' },
          ...[1, 2].map(v => h(ctx.doc, 'option', { value: v }))
        )
      ),
      null
    );
    expect(component.selectedValue, `component.selectedValue`).to.equal(undefined);
    host.firstChild.childNodes.item(1)['selected'] = true;
    expect(component.selectedValue, `component.selectedValue`).to.equal(undefined);
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.selectedValue, `component.selectedValue`).to.equal('2');
    tearDown(au, lifecycle, host);
  });

  function template(doc: Document, attrs: Record<string, any> | null, ...children: Element[]) {
    return h(doc, 'template', attrs, ...children);
  }

  function select(doc: Document, attrs: Record<string, any> | null, ...children: (HTMLOptionElement | HTMLOptGroupElement)[]) {
    return h(doc, 'select', attrs, ...children);
  }

  function option(doc: Document, attrs: Record<string, any> | null) {
    return h(doc, 'option', attrs);
  }
});
