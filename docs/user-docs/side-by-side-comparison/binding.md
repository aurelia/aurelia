# Binding

### String Interpolation

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| ${ } | **✓** |  |

### Binding HTML and SVG Attributes

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| one-way | **✓** |  |
| to-view | **✓** |  |
| from-view | **✓** |  |
| two-way | **✓** |  |
| one-time | **✓** |  |
| bind | **✓** |  |

### Referencing DOM Elements

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| ref | **✓** |  |

### Passing Function References

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| call | **✓** |  |

### DOM Events

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| trigger | **✓** |  |
| delegate | **✓** |  |
| capture | **✓** |  |

### Contextual Properties

**General**

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| $this | **✓** | The view-model that your binding expressions are being evaluated against. |

**Event**

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| $event | **✓** | The DOM Event in `delegate`, `trigger`, and `capture` bindings. |

**Repeater**

| Name | Aurelia 1 | Aurelia 2 | Description |
| :--- | :--- | :--- | :--- |
| $parent | **✓** | **✓** |  |
| $parent.$parent.$parent.name | **✓** | **✓** |  |
| $index | **✓** | **✓** |  |
| $first | **✓** | **✓** |  |
| $last | **✓** | **✓** |  |
| $even | **✓** | **✓** |  |
| $odd | **✓** | **✓** |  |
| $length | **✗** | **✓** |  |

### @computedFrom

`@computedFrom` tells the binding system which expressions to observe. When those expressions change, the binding system will re-evaluate the property \(execute the getter\).

| Aurelia 1 | Aurelia 2 |
| :--- | :--- |
| **✓** | **✗** |

{% hint style="info" %}
In Aurelia 2, The framework automatically computes observation without the need for any configuration or decorator.
{% endhint %}

### @attributePattern

This feature is totally new for Aurelia 2.

```typescript
// Angular binding syntax simulation

// <input [disabled]="condition ? true : false">
@attributePattern({ pattern: '[PART]', symbols: '[]' })
export class AngularOneWayBindingAttributePattern {
    public ['[PART]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'one-way');
    }
}

// <input [(ngModel)]="name">
@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {
    public ['[(PART)]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }
}

// <input #phone placeholder="phone number" />
@attributePattern({ pattern: '#PART', symbols: '#' })
export class AngularSharpRefAttributePattern {
    public ['#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[0], 'element', 'ref');
    }
}
```



