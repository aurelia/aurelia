import { customElement } from "@aurelia/runtime";

@customElement({
  name: 'page1',
  templateOrNode: require('./page1.html'),
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: [],
  dependencies: []
})
export class Page1 {

}
