
import { expect } from 'chai';
import { HTMLTemplateElementFactory, ITemplateElementFactory } from '../../src/template-element-factory';
import { HTMLTestContext, TestContext } from '../util';

describe('HTMLTemplateElementFactory', () => {
  let sut: HTMLTemplateElementFactory;
  let ctx: HTMLTestContext;

  beforeEach(() => {
    ctx = TestContext.createHTMLTestContext();
    sut = new HTMLTemplateElementFactory(ctx.dom);
  });

  it('template-wrapped markup string', () => {
    const markup = `<template><div class="au">foo</div></template>`;

    const expectedHTML = markup;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('non-template-wrapped markup string', () => {
    const markup = `<div class="au">foo</div>`;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('double template-wrapped markup string', () => {
    const markup = `<template><div class="au">foo</div></template>`.repeat(2);

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('double non-template-wrapped markup string', () => {
    const markup = `<div class="au">foo</div>`.repeat(2);

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('template node', () => {
    const markup = `<div class="au">foo</div>`;
    const template = ctx.createElement('template');
    template.innerHTML = markup;
    const node = template;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(node).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('non-template node', () => {
    const markup = `<div class="au">foo</div>`;
    const template = ctx.createElement('template') as HTMLTemplateElement;
    template.innerHTML = markup;
    const node = template.content.firstElementChild;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(node).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('template node with parent', () => {
    const markup = `<template><div class="au">foo</div></template>`;
    const template = ctx.createElement('template') as HTMLTemplateElement;
    template.innerHTML = markup;
    const node = template.content.firstElementChild;

    expect(node.parentNode).not.to.equal(null);

    const expectedHTML = markup;
    const actualNode = sut.createTemplate(node);

    expect(actualNode.outerHTML).to.equal(expectedHTML);
    expect(actualNode.parentNode).to.equal(null);
  });
});
