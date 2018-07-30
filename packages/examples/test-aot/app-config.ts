import { ITemplateSource, TargetedInstructionType } from "../runtime/templating/instructions";

//extracted from view imports
import * as import1 from "./name-tag";
import { DelegationStrategy } from "../runtime/binding/event-manager";

//this object is built up during compilation
export const appConfig: ITemplateSource = {
  name: 'app',
  dependencies: [
    import1
  ],
  template: `
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
        src: 'message'
      }
    ],
    [
      {
        type: TargetedInstructionType.textBinding,
        src: 'computedMessage'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'message',
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
            src: 'message',
            dest: 'name'
          },
          {
            type: TargetedInstructionType.refBinding,
            src: 'nameTag'
          }
        ]
      }
    ],
    [
      {
        type: TargetedInstructionType.textBinding,
        src: 'message'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'duplicateMessage',
        dest: 'checked'
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateTemplateController,
        res: 'if',
        src: {
          template: `<div><au-marker class="au"></au-marker> </div>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.textBinding,
                src: 'message'
              }
            ]
          ]
        },
        instructions: [
          {
            type: TargetedInstructionType.toViewBinding,
            src: 'duplicateMessage',
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
        src: {
          template: `<div><au-marker class="au"></au-marker> </div>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.textBinding,
                src: 'description'
              }
            ]
          ]
        },
        instructions: [
          {
            type: TargetedInstructionType.toViewBinding,
            src: 'todos',
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
        src: 'click',
        dest: 'addTodo',
        preventDefault: true,
        strategy: DelegationStrategy.none
      }
    ]
  ],
  surrogates: []
};
