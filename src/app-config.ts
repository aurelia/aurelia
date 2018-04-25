import { ICompiledViewSource, TargetedInstructionType } from "./runtime/templating/instructions";

//extracted from view imports
import * as import1 from "./name-tag";

//this object is built up during compilation
export const appConfig: ICompiledViewSource = {
  name: 'app',
  dependencies: [
    import1
  ],
  template: `
    <au-marker class="au"></au-marker> <br>
    <input type="text" class="au">
    <name-tag class="au">
      <au-content>
        <h2>Message: <au-marker class="au"></au-marker> </h2>
      </au-content>
    </name-tag>
    <input type="checkbox" class="au" />
    <au-marker class="au"></au-marker>
    <au-marker class="au"></au-marker>
  `,
  targetInstructions: [
    [
      {
        type: TargetedInstructionType.textBinding,
        src: 'message'
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
          targetInstructions: [
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
            type: TargetedInstructionType.oneWayBinding,
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
          targetInstructions: []
        },
        link: true,
        instructions: []
      }
    ]
  ],
  surrogateInstructions: []
};
