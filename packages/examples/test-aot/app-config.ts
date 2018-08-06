import { ITemplateSource, TargetedInstructionType, BindingMode } from '@aurelia/runtime';

//extracted from view imports
import * as import1 from "./name-tag";
import { DelegationStrategy } from '@aurelia/runtime';

//this object is built up during compilation
export const appConfig: ITemplateSource = {
  name: 'app',
  dependencies: [
    import1
  ],
  templateOrNode: `
    <au-marker class="au"></au-marker> <br/>
    <au-marker class="au"></au-marker> <br/>
    <input type="text" class="au">
    <name-tag class="au">
      <h2>Message: <au-marker class="au"></au-marker> </h2>
    </name-tag>
    <input type="checkbox" class="au" />
    <au-marker class="au"></au-marker>
    <au-marker class="au"></au-marker>
    <au-marker class="au"></au-marker>
    <button class="au">Add Todo</button>
  `,
  instructions: [
    [
      {
        type: TargetedInstructionType.textBinding,
        srcOrExpr: 'message'
      }
    ],
    [
      {
        type: TargetedInstructionType.textBinding,
        srcOrExpr: 'computedMessage'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        srcOrExpr: 'message',
        dest: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateElement,
        res: 'name-tag',
        instructions: [
          {
            type: TargetedInstructionType.twoWayBinding,
            srcOrExpr: 'message',
            dest: 'name'
          },
          {
            type: TargetedInstructionType.refBinding,
            srcOrExpr: 'nameTag'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.textBinding,
        srcOrExpr: 'message'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        srcOrExpr: 'duplicateMessage',
        dest: 'checked'
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'if',
        src: {
          templateOrNode: `<div><au-marker class="au"></au-marker> </div>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.textBinding,
                srcOrExpr: 'message'
              }
            ]
          ]
        },
        instructions: [
          {
            type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView,
            srcOrExpr: 'duplicateMessage',
            dest: 'condition'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'else',
        src: {
          templateOrNode: `<div>No Message Duplicated</div>`,
          instructions: []
        },
        link: true,
        instructions: []
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'repeat',
        src: {
          templateOrNode: `<div><au-marker class="au"></au-marker> </div>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.textBinding,
                srcOrExpr: 'description'
              }
            ]
          ]
        },
        instructions: [
          {
            type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView,
            srcOrExpr: 'todos',
            dest: 'items'
          },
          {
            type: TargetedInstructionType.setProperty,
            value: 'todo',
            dest: 'local'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.listenerBinding,
        srcOrExpr: 'click',
        dest: 'addTodo',
        preventDefault: true,
        strategy: DelegationStrategy.none
      }
    ]
  ],
  surrogates: []
};
