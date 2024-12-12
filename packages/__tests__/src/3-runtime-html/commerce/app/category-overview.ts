import { bindable, customElement } from '@aurelia/runtime-html';
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
  @bindable state: DashboardState;
}
