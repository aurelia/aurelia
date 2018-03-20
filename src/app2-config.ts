import { CompiledElementConfiguration } from "./compiled-element";
import { Template } from "./framework/templating/template";
import { NameTag } from "./name-tag2";

//this object is built up during compilation
export const app2Config: CompiledElementConfiguration = {
  name: 'app',
  template: `
    <au-marker class="au"></au-marker> <br>
    <input type="text" class="au">
    <name-tag class="au"></name-tag>
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
    ]
  ],
  surrogateInstructions: []
};
