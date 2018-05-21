import { ShadowDOMEmulation } from "./runtime/templating/shadow-dom";
import { ITemplateSource, TargetedInstructionType } from "./runtime/templating/instructions";
import { DelegationStrategy } from "./runtime/binding/event-manager";

//this object is built up during compilation
export const nameTagConfig: ITemplateSource = {
  name: 'name-tag',
  hasSlots: true,
  template: `
    <header>Super Duper name tag</header>
    <div>
      <input type="text" class="au"><br/>
      <span class="au" style="font-weight: bold; padding: 10px 0;"></span>
    </div>
    <hr/>
    <div>
      <label>
        Name tag color:
        <select class="au">
          <option>red</option>
          <option>green</option>
          <option>blue</option>
        </select>
      </label>
    </div>
    <hr/>
    <div>
      <label>
        Name tag border color:
        <select class="au">
          <option>orange</option>
          <option>black</option>
          <option>rgba(0,0,0,0.5)</option>
        </select>
      </label>
      <slot class="au"></slot>
    </div>
    <hr/>
    <div>
      <label>
        Name tag border width:
        <input type="number" class="au" min="1" step="1" max="10" />
      </label>
    </div>
    <div>
      <label>
        Show header:
        <input type="checkbox" class="au" />
      </label>
    </div>
    <button class="au">Reset</button>
  `,
  instructions: [
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'name',
        dest: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.oneWayBinding,
        src: 'name',
        dest: 'textContent'
      },
      {
        type: TargetedInstructionType.stylePropertyBinding,
        src: 'nameTagColor',
        dest: 'color'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'nameTagColor',
        dest: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'nameTagBorderColor',
        dest: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.hydrateSlot
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'nameTagBorderWidth',
        dest: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        src: 'nameTagHeaderVisible',
        dest: 'checked'
      }
    ],
    [
      {
        type: TargetedInstructionType.listenerBinding,
        src: 'click',
        dest: 'submit',
        preventDefault: true,
        strategy: DelegationStrategy.none
      }
    ]
  ],
  surrogates: [
    {
      type: TargetedInstructionType.stylePropertyBinding,
      src: 'nameTagBorder',
      dest: 'border'
    },
    {
      type: TargetedInstructionType.oneWayBinding,
      src: 'nameTagClasses',
      dest: 'className'
    }
  ]
};
