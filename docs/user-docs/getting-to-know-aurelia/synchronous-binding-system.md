# Understanding Aurelia's Binding System and State Management

Aurelia v2 uses a hybrid binding system that combines synchronous property notifications with asynchronous computed property updates. While observable property changes trigger immediate notifications, computed properties use asynchronous updates by default to prevent common issues like state tearing.

Understanding when updates are synchronous vs. asynchronous is crucial for managing complex state changes effectively. This document explains how Aurelia's binding system works and when you might need to use tools like `batch()` to ensure consistency.

## Synchronous vs Asynchronous Updates

### Observable Properties: Synchronous
Regular observable properties notify changes immediately when set:

```typescript
import { observable } from 'aurelia';

class User {
  @observable firstName = '';
  @observable lastName = '';
}

const user = new User();
// This triggers immediate notifications
user.firstName = 'John';  // Subscribers notified immediately
user.lastName = 'Doe';   // Subscribers notified immediately
```

### Computed Properties: Asynchronous by Default
Computed properties defer their updates to prevent state tearing:

```typescript
import { computed } from 'aurelia';

class NameTag {
    @observable firstName = '';
    @observable lastName = '';

    // Async by default - safe from state tearing
    @computed({ flush: 'async' })
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
```

## Understanding State Tearing

State tearing occurs when multiple related state updates trigger intermediate computations with incomplete data. While Aurelia's async-by-default computed properties prevent most state tearing, you can still encounter it with synchronous computed properties.

### Example: Synchronous Computed Properties Can Still Tear

```typescript
import { observable, computed } from 'aurelia';

class NameTag {
    @observable firstName = '';
    @observable lastName = '';

    update(first, last) {
        this.firstName = first;  // Triggers sync computed immediately
        this.lastName = last;    // Triggers sync computed again
    }

    // SYNC computed - prone to state tearing
    @computed({ flush: 'sync' })
    get fullName() {
        if (!this.firstName || !this.lastName) {
            throw new Error('Both names required');
        }
        return `${this.firstName} ${this.lastName}`;
    }
}

const nameTag = new NameTag();
// This may throw an error because fullName is computed after firstName 
// is updated but before lastName is updated
nameTag.update('John', 'Doe'); // 💥 Potential error
```

## Managing State Updates with Batch

Aurelia provides the `batch` function to handle multiple state updates efficiently. The batch function groups state changes and defers change notifications until all updates within the batch are complete. This is essential when working with synchronous computed properties or when you need atomic updates.

### Fixing State Tearing with Batch

Here's how to fix the previous example using `batch`:

```typescript
import { observable, computed, batch } from 'aurelia';

class NameTag {
    @observable firstName = '';
    @observable lastName = '';

    update(first, last) {
        batch(() => {
            this.firstName = first;
            this.lastName = last;
        });
    }

    @computed({ flush: 'sync' })
    get fullName() {
        if (!this.firstName || !this.lastName) {
            throw new Error('Both names required');
        }
        return `${this.firstName} ${this.lastName}`;
    }
}

const nameTag = new NameTag();
nameTag.update('John', 'Doe'); // ✅ No error - both updates happen atomically
```

### Comparing Sync vs Async Computed Properties

```typescript
import { observable, computed, batch, tasksSettled } from 'aurelia';

class ComparisonExample {
    @observable count = 0;

    // Async computed (default) - updates after tasks settle
    @computed({ flush: 'async' })
    get asyncDouble() {
        console.log('Computing async double:', this.count);
        return this.count * 2;
    }

    // Sync computed - updates immediately
    @computed({ flush: 'sync' })
    get syncDouble() {
        console.log('Computing sync double:', this.count);
        return this.count * 2;
    }

    async demonstrateDifference() {
        console.log('--- Without batch ---');
        this.count = 1;  // Sync computed runs immediately
        this.count = 2;  // Sync computed runs again
        this.count = 3;  // Sync computed runs again
        
        // Async computed hasn't run yet
        console.log('Before tasksSettled, asyncDouble:', this.asyncDouble); // Still 0
        
        await tasksSettled(); // Now async computed updates
        console.log('After tasksSettled, asyncDouble:', this.asyncDouble); // Now 6

        console.log('--- With batch ---');
        batch(() => {
            this.count = 4;  // Sync computed deferred
            this.count = 5;  // Sync computed deferred  
            this.count = 6;  // Sync computed deferred
        });
        // Sync computed runs only once with final value
        
        await tasksSettled();
        console.log('Final values - sync:', this.syncDouble, 'async:', this.asyncDouble);
    }
}
```

## When to Use Sync vs Async Computed Properties

### Use Async Computed Properties (Default) When:
- **Performance matters**: Async computed properties prevent unnecessary intermediate calculations
- **Complex dependencies**: When your computed property depends on multiple observable properties
- **Template bindings**: Most template bindings work well with async updates
- **Default choice**: Choose async unless you have a specific need for synchronous behavior

```typescript
// Good for templates - async by default
@computed({ flush: 'async' })
get displayName() {
    return `${this.firstName} ${this.lastName}`.trim();
}
```

### Use Sync Computed Properties When:
- **Immediate consistency required**: When other code needs the computed value immediately
- **Simple, fast computations**: When the computation is trivial and won't cause performance issues
- **Legacy integration**: When integrating with code that expects synchronous updates

```typescript
// Use sync only when you need immediate consistency
@computed({ flush: 'sync' })
get isValidForm() {
    return this.email.includes('@') && this.password.length >= 8;
}
```

## Benefits of Using Batch

- **Consistency**: Ensures that all related state changes are processed together, avoiding premature evaluations
- **Performance**: Reduces unnecessary recomputations by grouping state changes
- **Atomic updates**: Makes multiple property changes appear as a single update to observers
- **Predictability**: Controls exactly when change notifications are sent

## Best Practices

1. **Prefer async computed properties** - They're safer and perform better
2. **Use batch() for multiple related updates** - Especially when updating several properties that affect the same computed properties
3. **Await tasksSettled() in tests** - Async computed properties require waiting for task completion
4. **Only use sync computed properties when necessary** - They can cause performance issues with frequent updates

```typescript
// Example: Updating a user profile
class UserProfile {
    @observable firstName = '';
    @observable lastName = '';
    @observable email = '';
    @observable avatar = '';

    // Async computed - safe and performant
    @computed({ flush: 'async' })
    get displayInfo() {
        return {
            name: `${this.firstName} ${this.lastName}`,
            contact: this.email,
            hasAvatar: !!this.avatar
        };
    }

    // Update multiple properties atomically
    updateProfile(data) {
        batch(() => {
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.email = data.email;
            this.avatar = data.avatar;
        });
    }
}
```

Aurelia's hybrid binding system gives you the flexibility to choose the right approach for your use case. The async-by-default behavior provides safety and performance, while batch() ensures consistency when you need atomic updates.
