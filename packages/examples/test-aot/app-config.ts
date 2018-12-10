import { ITemplateDefinition, TargetedInstructionType, BindingMode } from '@aurelia/runtime';

//extracted from view imports
import * as import1 from "./name-tag";
import { DelegationStrategy } from '@aurelia/runtime';

//this object is built up during compilation
export const appConfig: ITemplateDefinition = {
  name: 'app',
  dependencies: [
    import1
  ],
  template: `
    <au-m class="au"></au-m> <br/>
    <au-m class="au"></au-m> <br/>
    <input type="text" class="au">
    <name-tag class="au">
      <h2>Message: <au-m class="au"></au-m> </h2>
    </name-tag>
    <input type="checkbox" class="au" />
    <au-m class="au"></au-m>
    <au-m class="au"></au-m>
    <au-m class="au"></au-m>
    <button class="au">Add Todo</button>
  `,
  instructions: [
    [
      {
        type: TargetedInstructionType.textBinding,
        from: 'message'
      }
    ],
    [
      {
        type: TargetedInstructionType.textBinding,
        from: 'computedMessage'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        from: 'message',
        to: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateElement,
        res: 'name-tag',
        instructions: [
          {
            type: TargetedInstructionType.twoWayBinding,
            from: 'message',
            to: 'name'
          },
          {
            type: TargetedInstructionType.refBinding,
            from: 'nameTag'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.textBinding,
        from: 'message'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        from: 'duplicateMessage',
        to: 'checked'
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'if',
        def: {
          template: `<div><au-m class="au"></au-m> </div>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.textBinding,
                from: 'message'
              }
            ]
          ]
        },
        instructions: [
          {
            type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView,
            from: 'duplicateMessage',
            to: 'condition'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'else',
        def: {
          template: `<div>No Message Duplicated</div>`,
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
        def: {
          template: `<div><au-m class="au"></au-m> </div>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.textBinding,
                from: 'description'
              }
            ]
          ]
        },
        instructions: [
          {
            type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView,
            from: 'todos',
            to: 'items'
          },
          {
            type: TargetedInstructionType.setProperty,
            value: 'todo',
            to: 'local'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.listenerBinding,
        from: 'click',
        to: 'addTodo',
        preventDefault: true,
        strategy: DelegationStrategy.none
      }
    ]
  ],
  surrogates: []
};
