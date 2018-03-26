import { Template, CompiledElementSource } from "./runtime/templating/template";
import { NameTag } from "./name-tag";
import { If } from "./runtime/resources/if";
import { Else } from "./runtime/resources/else";

//this object is built up during compilation
export const appConfig: CompiledElementSource = {
  name: 'app',
  template: `
    <au-marker class="au"></au-marker> <br>
    <input type="text" class="au">
    <name-tag class="au"></name-tag>
    <input type="checkbox" class="au" />
    <au-marker class="au"></au-marker>
    <au-marker class="au"></au-marker>
  `,
  observers: [
    {
      name: 'message'
    },
    {
      name: 'duplicateMessage'
    }
  ],
  targetInstructions: [
    [
      {
        type: 'oneWayText',
        source: 'message'
      }
    ],
    [
      {
        type: 'twoWay',
        source: 'message',
        target: 'value'
      }
    ],
    [
      {
        type: 'element',
        ctor: NameTag,
        instructions: [
          {
            type: 'twoWay',
            source: 'message',
            target: 'name'
          },
          {
            type: 'ref',
            source: 'nameTag'
          }
        ]
      }
    ],
    [
      {
        type: 'twoWay',
        source: 'duplicateMessage',
        target: 'checked'
      }
    ],
    [
      {
        type: 'templateController',
        ctor: If,
        config: {
          template: `<div><au-marker class="au"></au-marker> </div>`,
          targetInstructions: [
            [
              {
                type: 'oneWayText',
                source: 'message'
              }
            ]
          ]
        },
        instructions: [
          {
            type: 'oneWay',
            source: 'duplicateMessage',
            target: 'condition'
          }
        ]
      }
    ],
    [
      {
        type: 'templateController',
        ctor: Else,
        link: true,
        config: {
          template: `<div>No Message Duplicated</div>`,
          targetInstructions: []
        },
        instructions: []
      }
    ]
  ],
  surrogateInstructions: []
};
