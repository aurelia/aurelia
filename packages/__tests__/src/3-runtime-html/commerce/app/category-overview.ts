import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel, Repeat } from '@aurelia/runtime-html';
import { CategoryItemView } from './category-item-view.js';
import { Category } from '../domain/index.js';
import { assert } from '@aurelia/testing';

@customElement({
  name: 'category-overview',
  template: `
    <category-item-view repeat.for="category of categories" category.bind="category"></category-item-view>
  `,
  dependencies: [
    CategoryItemView,
  ]
})
export class CategoryOverview {
  private readonly log = resolve(ILogger).scopeTo('> CategoryOverview');

  @bindable categories: Category[];
  // Note: these twoWay bindings are a bit contrived but the point is to test data passing
  // through multiple layers of bindings
  @bindable({ mode: 'twoWay' }) showProjectedTrends: boolean;
  @bindable({ mode: 'twoWay' }) enableAutoRestock: boolean;

  get itemViews() {
    return (
      this.$controller!.children.find(x => x.viewModel instanceof Repeat)!.viewModel as Repeat
    ).views.map(x => x.children[0].viewModel as CategoryItemView);
  }

  binding() {
    this.log.debug('binding');
  }

  bound() {
    this.log.debug('bound');
  }

  attaching() {
    this.log.debug('attaching');
    this._assertRepeatedViewsEmpty();
  }

  attached() {
    this.log.debug('attached');
    this._assertRepeatedViewsMatchState();
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
    this._assertRepeatedViewsMatchState();
  }

  dispose() {
    this.log.debug('dispose');
  }

  _assertRepeatedViewsEmpty() {
    assert.strictEqual(this.itemViews.length, 0);
  }

  _assertRepeatedViewsMatchState() {
    assert.strictEqual(this.itemViews.length, this.categories.length, 'categoryItemViews');
  }

  _assertViewsMatchState() {
    this.log.debug('_assertViewsMatchState');
    assert.strictEqual(this.itemViews.length, this.categories.length, 'categoryItemViews');
    for (const view of this.itemViews) {
      view._assertViewsMatchState();
    }
  }
}
export interface CategoryOverview extends ICustomElementViewModel {}
