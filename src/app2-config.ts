import { CompiledElementConfiguration } from "./compiled-element";
import { Template } from "./framework/templating/template";
import { NameTag } from "./name-tag2";
import { If } from "./framework/resources/if";
import { Else } from "./framework/resources/else";

//this object is built up during compilation
export const app2Config: CompiledElementConfiguration = {
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
