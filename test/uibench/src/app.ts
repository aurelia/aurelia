import { bindable, customElement } from "@aurelia/runtime";

@customElement({
  name: 'app', template:
    `
    <template>
  <div class="Main">
    <table-component if.bind="data.location === 'table'" data.one-time="data"></table-component>
    <div as-element="anim" if.bind="data.location === 'anim'" data.one-time="data"></div>
    <tree-element if.bind="data.location === 'tree'" data.one-time="data"></tree-element>
  </div>
  </template>
`})
export class App {
  @bindable public data: any;

}
