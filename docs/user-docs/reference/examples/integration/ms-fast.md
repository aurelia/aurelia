# Microsoft FAST

If the example doesn't seem obvious, the following prerequisite reads are recommended:

{% content-ref url="../../../developer-guides/scenarios/extending-templating-syntax.md" %}
[extending-templating-syntax.md](../../../developer-guides/scenarios/extending-templating-syntax.md)
{% endcontent-ref %}

* [extending templating syntax](../../../developer-guides/scenarios/extending-templating-syntax.md)

The following is a code example of how to teach Aurelia to work seamlessly with [Microsoft FAST](https://www.fast.design/):

```typescript
import { AppTask, IContainer, IAttrMapper, NodeObserverLocator } from 'aurelia';

Aurelia.register(AppTask.beforeCreate(IContainer, container => {
  const attrMapper = container.get(IAttrMapper);
  const nodeObserverLocator = container.get(NodeObserverLocator);
  attrMapper.useTwoWay((el, property) => {
    switch (el.tagName) {
      case 'FAST-SLIDER':
      case 'FAST-TEXT-FIELD':
      case 'FAST-TEXT-AREA':
        return property === 'value';
      case 'FAST-CHECKBOX':
      case 'FAST-RADIO':
      case 'FAST-RADIO-GROUP':
      case 'FAST-SWITCH':
        return property === 'checked';
      case 'FAST-TABS':
        return property === 'activeid';
      default:
        return false;
    }
  });

  // Teach Aurelia what events to use to observe properties of elements.
  // Because FAST components all use a single change event to notify,
  // we can use a single common object
  const valuePropertyConfig = { events: ['input', 'change'] };
  nodeObserverLocator.useConfig({
    'FAST-CHECKBOX': {
      checked: valuePropertyConfig
    },
    'FAST-RADIO': {
      checked: valuePropertyConfig
    },
    'FAST-RADIO-GROUP': {
      value: valuePropertyConfig
    },
    'FAST-SLIDER': {
      value: valuePropertyConfig
    },
    'FAST-SWITCH': {
      checked: valuePropertyConfig
    },
    'FAST-TABS': {
      activeid: valuePropertyConfig
    },
    'FAST-TEXT-FIELD': {
      value: valuePropertyConfig
    },
    'FAST-TEXT-AREA': {
      value: valuePropertyConfig
    }
  });
}))
```
