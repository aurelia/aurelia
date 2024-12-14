import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { CategoryItemView } from './category-item-view.js';
import { DashboardState } from '../domain/index.js';

@customElement({
  name: 'category-overview',
  template: `
    <category-item-view repeat.for="category of state.categories" category.bind="category"></category-item-view>
  `,
  dependencies: [
    CategoryItemView,
  ]
})
export class CategoryOverview {
  private readonly log = resolve(ILogger).scopeTo('> CategoryOverview');

  @bindable state: DashboardState;

  hydrating() {
    this.log.debug('hydrating');
  }

  hydrated() {
    this.log.debug('hydrated');
  }

  created() {
    this.log.debug('created');
  }

  binding() {
    this.log.debug('binding');
  }

  bound() {
    this.log.debug('bound');
  }

  attaching() {
    this.log.debug('attaching');
  }

  attached() {
    this.log.debug('attached');
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface CategoryOverview extends ICustomElementViewModel {}
