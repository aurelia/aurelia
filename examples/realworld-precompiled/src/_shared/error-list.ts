import { customElement, ICustomElementViewModel, bindable } from 'aurelia';
import { ErrorList } from '../api';
import { h } from '../util';

@customElement({
  name: 'error-list',
  needsCompile: false,
  template: `<ul class="error-messages au"><!--au-start--><!--au-end--><au-m class="au"></au-m></ul>`,
  instructions: [[
    h.attr('show', [
      h.bindProp('errors.length', 'value', 2),
    ]),
  ], [
    h.templateCtrl('repeat', [h.bindIterator('error of errors', 'items', [])], {
      template: `<li><span><!--au-start--><!--au-end--><au-m class="au"></au-m></span><!--au-start--><!--au-end--><au-m class="au"></au-m></li>`,
      instructions: [[
        h.bindText('error[(0)]', false),
      ], [
        h.templateCtrl('repeat', [h.bindIterator('msg of error[(1)]', 'items', [])], {
          template: `<span><!--au-start--><!--au-end--><au-m class="au"></au-m></span>`,
          instructions: [[
            h.bindText('msg', false),
          ]],
        }),
      ]],
    }),
  ]],
})
export class ErrorListCustomElement implements ICustomElementViewModel {
  @bindable() errors: ErrorList = [];
}
