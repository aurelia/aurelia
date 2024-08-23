import { customElement } from 'aurelia';
import { Model } from './edit';

@customElement({
  name: 'app-root',
  template: `
  Edit:
  <label>
  <input type="radio" name="edit" model.bind="true" checked.bind="isEditing"> Yes
</label>
  <label>
  <input type="radio" name="edit" model.bind="false" checked.bind="isEditing"> No
</label>
<br>
  <ed-it model.bind if.bind="isEditing"></ed-it>
  <template else>
  \${model.someProperty}
</emplate>`,
})
export class AppRoot {
  isEditing: boolean = false;
  model: Model = { someProperty: 1 };
}
