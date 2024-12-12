import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { CategoryItemView } from './category-item-view.js';
import { DashboardState } from '../domain/index.js';

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
  private readonly log = resolve(ILogger).scopeTo('CategoryOverview');

  @bindable state: DashboardState;
}
export interface CategoryOverview extends ICustomElementViewModel {}
