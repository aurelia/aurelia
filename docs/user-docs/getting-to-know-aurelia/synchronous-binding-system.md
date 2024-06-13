# Understanding Aurelia's Synchronous Binding System

Aurelia v2 employs a synchronous binding system, which immediately notifies changes as they occur. This approach provides great control and predictability over state changes. However, managing multiple state updates that must be processed together requires careful handling to ensure consistency.

Synchronous binding systems notify changes immediately, providing instant feedback and control. In contrast, asynchronous binding systems queue changes and notify them later, typically in the next microtask or tick, which can help avoid issues like state tearing but introduces other complexities like race conditions (if you worked with Aurelia 1, then you might be familiar with the need to use `queueMicroTask` to work around this in Aurelia 1).

## Understanding state tearing

State tearing occurs when multiple state updates that should be processed together result in premature change notifications and recomputations. This can lead to inconsistent states and application errors. Aurelia v2’s synchronous binding system is particularly prone to this issue.

Consider the following example:

{% code title=“name-tag.ts” %}
```typescript
class NameTag {
    firstName = '';
    lastName = '';

    update(first, last) {
        this.firstName = first;
        this.lastName = last;
    }

    @computed()
    get fullName() {
        if (!this.firstName || !this.lastName) {
            throw new Error('Only accepting names with both first and last names');
        }
        return `${this.firstName} ${this.lastName}`;
    }
}

const nameTag = new NameTag();
nameTag.update('John', 'Doe'); // 💥
```
{% endcode %}

In this example, updating `firstName` and `lastName` simultaneously causes an error. This happens because the synchronous change propagation causes the computed property `fullName` to be evaluated before both `firstName` and `lastName` have been updated.

## Managing state updates with batch

Aurelia provides the `batch` function to handle multiple state updates efficiently. The batch function groups state changes and defer change notifications until all updates within the batch are complete. This ensures that related states are updated together, maintaining consistency.

Here’s how to use the batch function to manage state updates:

{% code title=“name-tag.ts” %}
```typescript
import { batch } from 'aurelia';

class NameTag {
    firstName = '';
    lastName = '';

    update(first, last) {
        batch(() => {
            this.firstName = first;
            this.lastName = last;
        });
    }

    @computed()
    get fullName() {
        if (!this.firstName || !this.lastName) {
            throw new Error('Only accepting names with both first and last names');
        }
        return `${this.firstName} ${this.lastName}`;
    }
}

const nameTag = new NameTag();
nameTag.update('John', 'Doe'); // No error
```
{% endcode %}

By wrapping the state updates in a `batch` function, change notifications for `firstName` and `lastName` are deferred until both updates are complete. This ensures that the `fullName` computed property is evaluated with the latest values of `firstName` and `lastName`.

### Benefits of using batch

- **Consistency:** Ensures that all related state changes are processed together, avoiding premature evaluations.
- **Predictability:** Maintains the predictable nature of the synchronous binding system by controlling when notifications are sent.
- **Performance:** Reduces unnecessary recomputations by grouping state changes.

Aurelia’s synchronous binding system provides immediate change notifications, offering great control over state updates. Using the `batch` function, developers can efficiently manage multiple state updates, ensuring consistency and predictability in their applications. Proper use of batch enhances the robustness of Aurelia applications, making state management more reliable and efficient.
