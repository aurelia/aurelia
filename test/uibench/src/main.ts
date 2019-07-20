import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, customElement } from '@aurelia/runtime';
import { Anim } from 'components/anim/anim';
import { AnimBox } from 'components/anim/anim-box';
import { TableCell } from 'components/Table/table-cell';
import { TableComponent } from 'components/table/table-component';
import { TableRow } from 'components/table/table-row';
import { TreeElement } from 'components/tree/tree-element';
import { TreeLeaf } from 'components/tree/tree-leaf';
import { TreeNode } from 'components/tree/tree-node';
import 'promise-polyfill/lib/polyfill';
import { App } from './app';
import './uibench-base/assets/styles.css';
import * as uibench from './uibench-base/lib/uibench';
@customElement({
  containerless: true,
  name: 'main', template:
    `
<template>
<app if.bind="data" data.one-time="data"/>
<pre if.bind="samples">\${sampleText & oneTime}</pre>
</template>
`,
})
export class Main {
  public data: any = {};
  public samples: any;

  get sampleText() {
    return JSON.stringify(this.samples, null, ' ');
  }

  public attached() {
    const config = uibench.init('Aurelia', '2');
    uibench.run(
      (state) => {
        this.data = state;
      },
      (samples) => {
        this.samples = samples;
        // noop
      },
    );
  }
}

const container =
  BasicConfiguration.createContainer().register(
    Main,
    App,
    TreeElement,
    TreeLeaf,
    TreeNode,
    TableComponent,
    TableCell,
    TableRow,
    Anim,
    AnimBox,
  );

(global as any).au = new Aurelia(container)
  .register(BasicConfiguration, DebugConfiguration)
  .app({
    component: new Main(),
    host: document.querySelector('app')!,
  })
  .start();
