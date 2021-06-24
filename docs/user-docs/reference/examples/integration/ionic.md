# Ionic

If the example doesn't seem obvious, the following prerequisite reads are recommended:

* [extending templating syntax](https://github.com/aurelia/aurelia/tree/869a9ec4f2fedc41c333e0bd02c905de2ae709da/docs/user-docs/app-basics/extening-templating-syntax.md)

The following is a code example of how to teach Aurelia to work seamlessly with [Ionic Framework](https://ionicframework.com/):

```typescript
export class IonicFramework implements IRegistry {
    register(container: IContainer) {
        const attrMapper = container.get(IAttrMapper);
        const nodeObserverLocator = container.get(NodeObserverLocator);
        attrMapper.useTwoWay((el, property) => {
            if (el.tagName === 'ION-CHECKBOX' ||
                el.tagName === 'ION-TOGGLE'
            ) {
                return property === 'checked';
            }

            return el.tagName.startsWith('ION') && property === 'value';
        });
        const valuePropertyConfig = { events: ['ionChange'] };
        nodeObserverLocator.useConfig({
            'ION-INPUT': {
                value: valuePropertyConfig
            },
            'ION-TEXTAREA': {
                value: valuePropertyConfig
            },
            'ION-SELECT': {
                value: valuePropertyConfig
            },
            'ION-RADIO-GROUP': {
                value: valuePropertyConfig
            },
            'ION-RANGE': {
                value: valuePropertyConfig
            },
            'ION-SEARCHBAR': {
                value: valuePropertyConfig
            },
            'ION-SEGMENT': {
                value: valuePropertyConfig
            },
            'ION-TOGGLE': {
                checked: valuePropertyConfig
            },
            'ION-CHECKBOX': {
                checked: valuePropertyConfig
            }
        });
        return container;
    }
}
```

Inside startup of application add IonicFramework before the standard configuration **usually** main.ts

```typescript
Aurelia.register(IonicFramework, StandardConfiguration);
```

Ordering **matters** when registering conventionally. Please look at the [FAST Integration](ms-fast.md) for a more verbose way where order does not matter.

