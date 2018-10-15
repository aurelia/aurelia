import { ITemplateDefinition, TargetedInstructionType, BindingMode } from '@aurelia/runtime';
import { DelegationStrategy } from '@aurelia/runtime';

//this object is built up during compilation
export const nameTagConfig: ITemplateDefinition = {
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
        from: 'name',
        to: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView,
        from: 'name',
        to: 'textContent'
      },
      {
        type: TargetedInstructionType.stylePropertyBinding,
        from: 'nameTagColor',
        to: 'color'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        from: 'nameTagColor',
        to: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        from: 'nameTagBorderColor',
        to: 'value'
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
        from: 'nameTagBorderWidth',
        to: 'value'
      }
    ],
    [
      {
        type: TargetedInstructionType.twoWayBinding,
        from: 'nameTagHeaderVisible',
        to: 'checked'
      }
    ],
    [
      {
        type: TargetedInstructionType.listenerBinding,
        from: 'click',
        to: 'submit',
        preventDefault: true,
        strategy: DelegationStrategy.none
      }
    ]
  ],
  surrogates: [
    {
      type: TargetedInstructionType.stylePropertyBinding,
      from: 'nameTagBorder',
      to: 'border'
    },
    {
      type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView,
      from: 'nameTagClasses',
      to: 'className'
    }
  ]
};
