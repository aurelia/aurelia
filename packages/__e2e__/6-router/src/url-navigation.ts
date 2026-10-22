import Aurelia, { CustomElement } from 'aurelia';
import { ICurrentRoute, IRouter, RouterConfiguration, UrlCustomAttribute, type Params, type RouteNode } from '@aurelia/router';

const Home = CustomElement.define({ name: 'url-home', template: '<output id="home">Home</output>' }, class {});
const Item = CustomElement.define({
  name: 'url-item',
  template: `<output id="item">\${id}</output><output id="fragment">\${fragment}</output>`,
}, class {
  id: string;
  fragment: string;

  loading(params: Params, next: RouteNode) {
    this.id = params.id as string;
    this.fragment = next.fragment;
  }
});

const App = CustomElement.define({
  name: 'url-app',
  template: `
    <a id="sibling" url="b?filter=two%26three#details%25">Sibling</a>
    <a id="item-link" url="/items/a">Item</a>
    <a id="structured-item" load.bind="{ component: 'item', params: { id: 'draft(100%)' } }">Structured item</a>
    <a id="root" url="/">Home</a>
    <a id="parent" url="../">Parent directory</a>
    <a id="native" href.bind="router.createHref('/items/native?filter=link#section')" external>Native href</a>
    <button id="next-query" click.trigger="router.navigate('?filter=next')">Next query</button>
    <output id="filter">\${current.query.get('filter')}</output>
    <au-viewport></au-viewport>
  `,
}, class {
  static inject = [IRouter, ICurrentRoute];
  static routes = [
    { path: '', component: Home },
    { id: 'item', path: 'items/:id', component: Item },
    { id: 'repeated-base', path: 'url-navigation/items/:id', component: Item },
  ];

  // Observe the public query state: query-only history changes reuse the item
  // component and do not implicitly rerun its loading hook.
  constructor(public readonly router: IRouter, public readonly current: ICurrentRoute) {}
});

export function startUrlNavigation() {
  // Keep the ordinary fixture unchanged. This second application exercises a
  // deployment prefix and a real hash-routing document on the same CI server.
  document.querySelector('base').setAttribute('href', '/url-navigation/');
  const preserveHashDocument = location.pathname.endsWith('/shell.html');
  const useUrlFragmentHash = preserveHashDocument || location.hash.startsWith('#/');
  return new Aurelia()
    .register(RouterConfiguration.customize({ useUrlFragmentHash, preserveHashDocument }), UrlCustomAttribute)
    .app({ host: document.body, component: App })
    .start();
}
