import { customElement } from "@aurelia/runtime";

@customElement({
    name: 'tree',
    template:
        `<div class="Tree"><tree-node data.one-time="this.props.data.root" /></div>;`,
})
export class Tree {

}