
import { expect } from 'chai';
import { ITemplateElementFactory, ITemplateElementFactoryRegistration } from '@aurelia/jit-html';
import { HTMLTestContext, TestContext } from '@aurelia/testing';

describe('HTMLTemplateElementFactory', function () {
  let sut: ITemplateElementFactory<HTMLElement>;
  let ctx: HTMLTestContext;

  beforeEach(function () {
    ctx = TestContext.createHTMLTestContext();
    ctx.container.register(ITemplateElementFactoryRegistration);
    sut = ctx.container.get(ITemplateElementFactory) as ITemplateElementFactory<HTMLElement>;
  });

  it('template-wrapped markup string', function () {
    const markup = `<template><div class="au">foo</div></template>`;

    const expectedHTML = markup;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('non-template-wrapped markup string', function () {
    const markup = `<div class="au">foo</div>`;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('double template-wrapped markup string', function () {
    const markup = `<template><div class="au">foo</div></template>`.repeat(2);

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('double non-template-wrapped markup string', function () {
    const markup = `<div class="au">foo</div>`.repeat(2);

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('template node', function () {
    const markup = `<div class="au">foo</div>`;
    const template = ctx.createElement('template');
    template.innerHTML = markup;
    const node = template;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(node).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('non-template node', function () {
    const markup = `<div class="au">foo</div>`;
    const template = ctx.createElement('template') as HTMLTemplateElement;
    template.innerHTML = markup;
    const node = template.content.firstElementChild;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.createTemplate(node).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('template node with parent', function () {
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
