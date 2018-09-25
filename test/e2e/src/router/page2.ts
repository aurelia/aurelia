import { customElement } from "@aurelia/runtime";

@customElement({
  name: 'page2',
  templateOrNode: require('./page2.html'),
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: [],
  dependencies: []
})
export class Page2 {

}
