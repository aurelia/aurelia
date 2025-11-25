import { resolve } from '@aurelia/kernel';
import { IRouteContext, IRouter, route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/transition-plan.spec.ts', function () {

  it('reloads component when navigation options set transitionPlan to replace and only query params change', async function () {
    @customElement({ name: 'qp-option-view', template: '' })
    class QueryOptionView {
      private readonly ctx = resolve(IRouteContext);
      public static messages: string[] = [];
      public loading(): void {
        const params = this.ctx
          .getRouteParameters<{ message?: unknown }>({ includeQueryParams: true });
        const value = params.message;
        QueryOptionView.messages.push(typeof value === 'string'
          ? value
          : value == null
            ? ''
            : JSON.stringify(value));
      }
    }

    @route({
      routes: [
        { id: 'test', path: 'test', component: QueryOptionView }
      ]
    })
    @customElement({ name: 'qp-option-root', template: '<au-viewport></au-viewport>' })
    class QueryOptionRoot { }

    const { au, container } = await start({ appRoot: QueryOptionRoot, registrations: [QueryOptionView] });
    const router = container.get(IRouter);
    QueryOptionView.messages = [];

    await router.load('test', { transitionPlan: 'replace', queryParams: { message: 'one' } });
    await router.load('test', { transitionPlan: 'replace', queryParams: { message: 'two' } });

    assert.deepStrictEqual(QueryOptionView.messages, ['one', 'two']);

    await au.stop(true);
  });

  it('reloads component when route config transitionPlan is replace and only query params change', async function () {
    @customElement({ name: 'qp-config-view', template: '' })
    class QueryConfigView {
      private readonly ctx = resolve(IRouteContext);
      public static messages: string[] = [];
      public loading(): void {
        const params = this.ctx
          .getRouteParameters<{ message?: unknown }>({ includeQueryParams: true });
        const value = params.message;
        QueryConfigView.messages.push(typeof value === 'string'
          ? value
          : value == null
            ? ''
            : JSON.stringify(value));
      }
    }

    @route({
      routes: [
        { id: 'test', path: 'test', component: QueryConfigView, transitionPlan: 'replace' }
      ]
    })
    @customElement({ name: 'qp-config-root', template: '<au-viewport></au-viewport>' })
    class QueryConfigRoot { }

    const { au, container } = await start({ appRoot: QueryConfigRoot, registrations: [QueryConfigView] });
    const router = container.get(IRouter);
    QueryConfigView.messages = [];

    await router.load('test?message=one');
    await router.load('test?message=two');

    assert.deepStrictEqual(QueryConfigView.messages, ['one', 'two']);

    await au.stop(true);
  });
});
