import { CustomElement } from '@aurelia/runtime-html';

const TEMPLATE =
`<template
  class="cursor \${big ? 'big' : '' } \${label ? 'label' : ''}"
  css='
    left: \${x || 0}px;
    top: \${y || 0}px;
    border-color: \${color};'>
  <span class='label' if.bind='label'>\${x}, \${y}</span>
</template>`;

export const Cursor = CustomElement.define({
  name: 'cursor',
  template: TEMPLATE,
  bindables: 'label, x, y, big, color'
    .split(',')
    .map(s => s.trim())
    .reduce(
      (props, prop) => {
        props[prop] = { property: prop, attribute: prop };
        return props;
      }
      , {}
    )
}, class {});
