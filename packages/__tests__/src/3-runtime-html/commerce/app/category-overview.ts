import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel, Repeat } from '@aurelia/runtime-html';
import { CategoryItemView } from './category-item-view.js';
import { DashboardState } from '../domain/index.js';
import { assert } from '@aurelia/testing';

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

  get itemViews() {
    return (
      this.$controller!.children.find(x => x.viewModel instanceof Repeat)!.viewModel as Repeat
    ).views.map(x => x.viewModel as CategoryItemView);
  }

  binding() {
    this.log.debug('binding');
  }

  bound() {
    this.log.debug('bound');
  }

  attaching() {
    this.log.debug('attaching');
    assert.strictEqual(this.itemViews.length, 0);
  }

  attached() {
    this.log.debug('attached');
    assert.strictEqual(this.itemViews.length, this.state.categories.length);
    this.log.debug(`verified ${this.state.categories.length} categories`);
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
    assert.strictEqual(this.itemViews.length, this.state.categories.length);
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface CategoryOverview extends ICustomElementViewModel {}
