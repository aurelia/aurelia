import { ITemplateSource, TargetedInstructionType } from "../runtime/templating/instructions";
import { DelegationStrategy } from "../runtime/binding/event-manager";

const listenerBinding = TargetedInstructionType.listenerBinding;
const textBinding = TargetedInstructionType.textBinding;
const hydrateTemplateController = TargetedInstructionType.hydrateTemplateController;
const setProperty = TargetedInstructionType.setProperty;
const toViewBinding = TargetedInstructionType.toViewBinding;
const none = DelegationStrategy.none;

//this object is built up during compilation
export const appConfig: ITemplateSource = {
  name: 'app',
  dependencies: [ ],
  template: `
    <div class="container">
      <div class="jumbotron">
        <div class="row">
          <div class="col-md-6">
            <h1>Aurelia</h1>
          </div>
          <div class="col-md-6">
            <div class="col-sm-6 smallpad">
              <button type="button" class="au btn btn-primary btn-block" id="run">Create 1,000 rows</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="au btn btn-primary btn-block" id="runlots">Create 10,000 rows</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="au btn btn-primary btn-block" id="add">Append 1,000 rows</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="au btn btn-primary btn-block" id="update">Update every 10th row</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="au btn btn-primary btn-block" id="clear">Clear</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="au btn btn-primary btn-block" id="swaprows">Swap Rows</button>
            </div>
          </div>
        </div>
      </div>
      <table class="table table-hover table-striped test-data">
        <tbody id="tbody">
          <tr class="au"></tr>
        </tbody>
      </table>
      <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
    </div>
  `,
  instructions: [
    [ { type: listenerBinding, src: 'click', dest: 'run', preventDefault: true, strategy: none } ],
    [ { type: listenerBinding, src: 'click', dest: 'runLots', preventDefault: true, strategy: none } ],
    [ { type: listenerBinding, src: 'click', dest: 'add', preventDefault: true, strategy: none } ],
    [ { type: listenerBinding, src: 'click', dest: 'update', preventDefault: true, strategy: none } ],
    [ { type: listenerBinding, src: 'click', dest: 'clear', preventDefault: true, strategy: none } ],
    [ { type: listenerBinding, src: 'click', dest: 'swapRows', preventDefault: true, strategy: none } ],
    [
      {
        type: hydrateTemplateController,
        res: 'repeat',
        src: {
          cache: "*",
          template: `
            <tr class="au">
              <td class="col-md-1">
                <au-marker class="au"></au-marker> 
              </td>
              <td class="col-md-4">
                <a class="au"><au-marker class="au"></au-marker> </a>
              </td>
              <td class="col-md-1">
                <a class="au"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
              </td>
              <td class="col-md-6">
              </td>
            </tr>
          `,
          instructions: [
            [ { type: toViewBinding, src: `item.id===$parent.store.selected?'danger':''`, dest: 'class' } ],
            [ { type: textBinding, oneTime: true, src: 'item.id' } ],
            [ { type: listenerBinding, src: 'click', dest: '$parent.select(item)', preventDefault: true, strategy: none } ],
            [ { type: textBinding, src: 'item.label' } ],
            [ { type: listenerBinding, src: 'click', dest: '$parent.remove(item)', preventDefault: true, strategy: none } ]
          ]
        },
        instructions: [
          { type: toViewBinding, src: 'store.data', dest: 'items' },
          { type: setProperty, value: 'item', dest: 'local' },
          { type: setProperty, value: false, dest: 'visualsRequireLifecycle' }
        ]
      }
    ]
  ],
  surrogates: []
};
