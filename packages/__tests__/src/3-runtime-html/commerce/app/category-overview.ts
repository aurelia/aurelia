import { bindable, customElement } from '@aurelia/runtime-html';
import { DashboardState } from '../domain';
import { CategoryItemView } from './category-item-view';

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
