# Component Lifecycle Diagrams

Visual explanations of Aurelia 2's component lifecycle with parent-child timing.

## Table of Contents
1. [Activation Sequence (Parent-Child)](#1-activation-sequence-parent-child)
2. [Deactivation Sequence (Parent-Child)](#2-deactivation-sequence-parent-child)
3. [Stack-Based Coordination](#3-stack-based-coordination)
4. [Async Lifecycle Behavior](#4-async-lifecycle-behavior)
5. [Common Pitfalls](#5-common-pitfalls)

---

## 1. Activation Sequence (Parent-Child)

How lifecycle hooks execute when activating a parent with children:

```
SCENARIO: Parent component with 2 children activates
═══════════════════════════════════════════════════════════════

Timeline:
─────────────────────────────────────────────────────────────

Time  Parent              Child-1            Child-2
────  ──────              ───────            ───────
  0   constructor()
  1   define()
  2   hydrating()
  3   hydrated()
      created() ←──────── created() ←─────── created()
                          │                  │
                          └─ children first ─┘

  4   binding() ──────┐
      ↓ (if async,    │
      blocks children)│
                      │
  5   ← resolve ──────┘
      bind() (connects bindings)

  6   attaching() ────┐
      _attach() DOM ──┤  binding() ────┐   binding() ────┐
                      │                │                  │
                      │  bind()        │   bind()         │
                      │                │                  │
                      │  attaching() ──┤   attaching() ───┤
                      │  _attach() DOM │   _attach() DOM  │
                      │                │                  │
                  ┌───┴────────────────┴──────────────────┘
                  │   (parent's attaching() and
                  │    children activation run in PARALLEL)
                  │
  7               └─→ Wait for all to complete

      attached() ←───── attached() ←──── attached()
      │                 │                 │
      └─ children first (bottom-up) ─────┘

  8   ACTIVATED


DETAILED ACTIVATION FLOW
═══════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────┐
│ CONSTRUCTION PHASE (Top ➞ Down)                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ Parent.constructor()                               │
│   → Child1.constructor()                           │
│   → Child2.constructor()                           │
│                                                    │
│ Parent.define()                                    │
│   → Child1.define()                                │
│   → Child2.define()                                │
│                                                    │
│ Parent.hydrating()                                 │
│   → Child1.hydrating()                             │
│   → Child2.hydrating()                             │
│                                                    │
│ Parent.hydrated()                                  │
│   → Child1.hydrated()                              │
│   → Child2.hydrated()                              │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ CREATED PHASE (Bottom ➞ Up)                        │
├────────────────────────────────────────────────────┤
│                                                    │
│   Child1.created()                                 │
│   Child2.created()                                 │
│     → Parent.created()  ← After all children      │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ BINDING PHASE (Top ➞ Down, Blocks Children)       │
├────────────────────────────────────────────────────┤
│                                                    │
│ Parent.binding()                                   │
│   ↓ (if async, children wait)                     │
│   ↓                                                │
│ [ await parent.binding() ]                         │
│   ↓                                                │
│ Parent.bind() - connects bindings to scope        │
│   ↓                                                │
│   Child1.binding()                                 │
│     ↓                                              │
│   [ await child1.binding() ]                       │
│     ↓                                              │
│   Child1.bind()                                    │
│                                                    │
│   Child2.binding()                                 │
│     ↓                                              │
│   [ await child2.binding() ]                       │
│     ↓                                              │
│   Child2.bind()                                    │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ BOUND PHASE (Bottom ➞ Up)                          │
├────────────────────────────────────────────────────┤
│                                                    │
│   Child1.bound()                                   │
│   Child2.bound()                                   │
│     → Parent.bound()  ← After children             │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ ATTACHING PHASE (Parallel!)                        │
├────────────────────────────────────────────────────┤
│                                                    │
│ Parent.attaching()         activatingStack = 1    │
│   ↓                              ↓                 │
│ Parent._attach()                 │                 │
│   → Append to DOM                │                 │
│                                  │                 │
│ [ Both run in PARALLEL ]         │                 │
│   ├─ await parent.attaching()    │                 │
│   └─ Child activation ───────────┘                 │
│        ├─ Child1.binding()       activatingStack++ │
│        ├─ Child1.bind()                            │
│        ├─ Child1.bound()                           │
│        ├─ Child1.attaching()                       │
│        ├─ Child1._attach()                         │
│        │    → Append to DOM                        │
│        │                                           │
│        ├─ Child2.binding()       activatingStack++ │
│        ├─ Child2.bind()                            │
│        ├─ Child2.bound()                           │
│        ├─ Child2.attaching()                       │
│        └─ Child2._attach()                         │
│             → Append to DOM                        │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ ATTACHED PHASE (Bottom ➞ Up)                       │
├────────────────────────────────────────────────────┤
│                                                    │
│ _leaveActivating() called on each child           │
│   activatingStack-- for each                      │
│                                                    │
│ When activatingStack === 0:                        │
│   Child1.attached()            activatingStack--  │
│   Child2.attached()            activatingStack--  │
│     → Parent.attached()        activatingStack--  │
│                                ↓                   │
│                           activatingStack === 0   │
│                           → state = activated     │
│                                                    │
└────────────────────────────────────────────────────┘


KEY IMPLEMENTATION DETAILS
═══════════════════════════════════════════════════════════

1. _enterActivating() increments activatingStack
   - Called when starting binding phase
   - Recursively increments parent's stack

2. Parent's attaching() runs in PARALLEL with children
   - Children start activating while parent is still attaching
   - This allows for better performance

3. attached() only called when stack === 0
   - _leaveActivating() decrements stack
   - When stack reaches 0, attached() is invoked
   - This ensures bottom-up execution

4. binding() can block
   - If it returns a Promise, children wait
   - This is why it's marked "blocks children" in docs
```

---

## 2. Deactivation Sequence (Parent-Child)

How lifecycle hooks execute when deactivating:

```
SCENARIO: Parent with 2 children deactivates
═══════════════════════════════════════════════════════════

Timeline:
─────────────────────────────────────────────────────────────

Time  Parent              Child-1            Child-2
────  ──────              ───────            ───────
  0   deactivate() ───┐
                      │
  1                   └──→ deactivate() ──→ deactivate()
                           │                 │
                           (children first)  │
                           │                 │
  2                        detaching() ←─────┘
                           │
                           (builds linked list)
                           │
  3   detaching() ←────────┘
      │
      (initiator collects all)
      │
  4   _leaveDetaching()
      └─→ detachingStack === 0

  5   removeNodes() ──┐
                      ├─→ removeNodes()
                      └─→ removeNodes()

      (DOM removed from all)

  6   unbinding() ────┐
                      ├─→ unbinding()
                      └─→ unbinding()

      (process linked list)

  7   unbind() ───────┐
                      ├─→ unbind()
                      └─→ unbind()

      DEACTIVATED


DETAILED DEACTIVATION FLOW
═══════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────┐
│ CHILD DEACTIVATION (Children First)                │
├────────────────────────────────────────────────────┤
│                                                    │
│ Parent.deactivate() called                         │
│   ↓                                                │
│   state = deactivating                             │
│   ↓                                                │
│   for each child:                                  │
│     child.deactivate(initiator, parent)           │
│       ↓                                            │
│       Child1.deactivate() ────┐                    │
│       Child2.deactivate() ────┤                    │
│                               │                    │
└───────────────────────────────┼────────────────────┘
                                ↓
┌────────────────────────────────────────────────────┐
│ DETACHING PHASE (Children First, Build List)       │
├────────────────────────────────────────────────────┤
│                                                    │
│   Child1.detaching()         detachingStack++     │
│     ↓ (await if async)                            │
│   Add Child1 to linked list                        │
│                                                    │
│   Child2.detaching()         detachingStack++     │
│     ↓ (await if async)                            │
│   Add Child2 to linked list                        │
│                                                    │
│ Parent.detaching()           detachingStack++     │
│   ↓ (await if async)                              │
│ Add Parent to linked list                          │
│                                                    │
│ Linked list: Child1 → Child2 → Parent            │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ DETACH PHASE (Initiator Processes All)             │
├────────────────────────────────────────────────────┤
│                                                    │
│ Initiator._leaveDetaching()                        │
│   ↓                                                │
│   detachingStack--                                 │
│   ↓                                                │
│ When stack === 0:                                  │
│   Process linked list:                             │
│     ↓                                              │
│   Parent.removeNodes()                             │
│   Child1.removeNodes()                             │
│   Child2.removeNodes()                             │
│     ↓                                              │
│   (DOM physically removed)                         │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ UNBINDING PHASE (Process List, Children First)     │
├────────────────────────────────────────────────────┤
│                                                    │
│ Walk linked list (Child1 → Child2 → Parent):      │
│                                                    │
│   Child1.unbinding()         unbindingStack++     │
│     ↓ (await if async)                            │
│   Child1.unbind()                                  │
│     → disconnect bindings                          │
│     → scope = null                                 │
│                                                    │
│   Child2.unbinding()         unbindingStack++     │
│     ↓ (await if async)                            │
│   Child2.unbind()                                  │
│     → disconnect bindings                          │
│     → scope = null                                 │
│                                                    │
│   Parent.unbinding()         unbindingStack++     │
│     ↓ (await if async)                            │
│   Parent.unbind()                                  │
│     → disconnect bindings                          │
│     → scope.parent = null                          │
│     → state = deactivated                          │
│                                                    │
└────────────────────────────────────────────────────┘


KEY IMPLEMENTATION DETAILS
═══════════════════════════════════════════════════════════

1. Children deactivate first
   - Parent calls deactivate on each child
   - Children process before parent continues

2. Linked list built during detaching
   - Each component adds itself to the list
   - List maintains deactivation order

3. Only initiator processes the list
   - Non-initiator components just add themselves
   - Initiator handles all DOM removal and unbinding

4. removeNodes() called before unbinding
   - DOM physically removed first
   - Then bindings are disconnected

5. unbinding() processed via linked list
   - Walks the list in order
   - Calls unbinding hooks sequentially


PARALLEL DETACHING
═══════════════════════════════════════════════════════════

When detaching() returns a Promise:

Parent.detaching() ─────┐
                        ├─ await (parallel)
Child1.detaching() ─────┤
                        ├─ await (parallel)
Child2.detaching() ─────┘

All detaching() hooks await in PARALLEL, then:
  → removeNodes() on all
  → unbinding() in sequence via linked list
  → unbind() completes deactivation

This allows exit animations to run simultaneously!
```

---

## 3. Stack-Based Coordination

How Aurelia ensures correct timing using activation/deactivation stacks:

```
ACTIVATION STACK MECHANISM
═══════════════════════════════════════════════════════════

Purpose: Ensure attached() only fires after ALL children are ready

private _activatingStack: number = 0;

_enterActivating() {
  ++this._activatingStack;     // Increment
  if (this.$initiator !== this) {
    this.parent._enterActivating();  // Propagate up
  }
}

_leaveActivating() {
  if (--this._activatingStack === 0) {  // Decrement
    // Stack is 0, all children done!
    this.attached();            // Call attached()
    this.state = activated;
  }
  if (this.$initiator !== this) {
    this.parent._leaveActivating();    // Propagate up
  }
}


STACK TIMELINE (Parent + 2 Children)
═══════════════════════════════════════════════════════════

Time  Action                           Parent Stack
────  ──────                           ────────────
  0   Parent.activate()                    0
  1   _enterActivating() (binding)         1  (Enter)

  2   Parent.binding() completes           1
  3   Parent.bind()                        1
  4   Parent.attaching()                   1
  5   _enterActivating() (attaching)       2  (Enter again)

  6   Child1 starts activating             3  (Child enters)
  7   Child1 attaching                     3

  8   Child2 starts activating             4  (Child enters)
  9   Child2 attaching                     4

 10   Parent.attaching() completes         4
 11   _leaveActivating() (attaching)       3  (Leave)

 12   Child1.attaching() completes         3
 13   Child1 _leaveActivating()            2  (Child leaves)
 14   Child1.attached()                    2  (Stack > 0, can't call parent yet)

 15   Child2.attaching() completes         2
 16   Child2 _leaveActivating()            1  (Child leaves)
 17   Child2.attached()                    1

 18   _leaveActivating() (binding)         0  (Stack === 0!)
 19   Parent.attached() -----------------  0  (NOW parent can fire)
      state = activated


DETACHING STACK MECHANISM
═══════════════════════════════════════════════════════════

Purpose: Await all detaching() Promises before removing DOM

private _detachingStack: number = 0;

_enterDetaching() {
  ++this._detachingStack;
}

_leaveDetaching() {
  if (--this._detachingStack === 0) {
    // All detaching() complete!
    this.removeNodes();       // Now safe to remove DOM
    // Process unbinding via linked list...
  }
}


DETACHING STACK TIMELINE
═══════════════════════════════════════════════════════════

Time  Action                           Stack
────  ──────                           ─────
  0   Parent.deactivate()                 0
  1   Child1.deactivate()                 0
  2   Child1.detaching() -> Promise       0
  3   _enterDetaching()                   1  (Track Promise)

  4   Child2.deactivate()                 1
  5   Child2.detaching() -> Promise       1
  6   _enterDetaching()                   2  (Track Promise)

  7   Parent.detaching() -> Promise       2
  8   _enterDetaching()                   3  (Track Promise)

  9   Child1 Promise resolves             3
 10   _leaveDetaching()                   2  (Done)

 11   Child2 Promise resolves             2
 12   _leaveDetaching()                   1  (Done)

 13   Parent Promise resolves             1
 14   _leaveDetaching()                   0  (Stack === 0!)
      removeNodes() on all --------------  0  (Now safe)
      unbinding() on all ----------------  0


WHY STACKS ARE NECESSARY
═══════════════════════════════════════════════════════════

Problem without stacks:
  - Parent's attached() might fire before children ready
  - DOM might be removed while animations still running
  - Race conditions between parent and children

Solution with stacks:
  - attached() only fires when stack === 0 (all done)
  - DOM only removed when all detaching() complete
  - Clean coordination between parent and children


MULTIPLE ENTER/LEAVE CALLS
═══════════════════════════════════════════════════════════

A single controller can call _enterActivating() multiple times:

1. Once for binding phase
2. Once for attaching phase

This is intentional! The stack tracks ALL pending work:
  - Parent's own lifecycle phases
  - Each child's activation

When stack reaches 0, everything is truly done.
```

---

## 4. Async Lifecycle Behavior

How async hooks affect timing:

```
SYNC VS ASYNC BINDING
═══════════════════════════════════════════════════════════

Synchronous binding():
──────────────────────────────────────────
export class MyComponent {
  binding() {
    this.data = setupData();  // ← Sync
  }
}

Timeline:
Parent.binding() ──┐
                   ├─ immediate
Parent.bind() ─────┘
  ↓
Child.binding() ───┐
                   ├─ immediate
Child.bind() ──────┘

Total: ~0ms blocking time


Asynchronous binding():
──────────────────────────────────────────
export class MyComponent {
  async binding() {
    this.data = await fetch('/api/data');  // ← Async
  }
}

Timeline:
Parent.binding() ──┐
                   ├─ await ─────────────┐ (500ms)
                   │                     │
                   │ (children blocked)  │
                   │                     │
                   └─────────────────────┘
Parent.bind() ─────┘
  ↓
Child.binding() ───┐  ← Only starts after parent resolves
                   ├─ immediate
Child.bind() ──────┘

Total: ~500ms blocking time


REAL-WORLD IMPACT
═══════════════════════════════════════════════════════════

Bad - Blocks children unnecessarily:
export class Parent {
  async binding() {
    // This blocks children for 1 second!
    await delay(1000);
    this.data = 'loaded';
  }
}

Good - Use loading() instead:
export class Parent {
  async loading() {
    // Children can start while this runs
    await delay(1000);
    this.data = 'loaded';
  }

  binding() {
    // Sync, doesn't block children
  }
}


ATTACHING() DOESN'T BLOCK CHILDREN
═══════════════════════════════════════════════════════════

Key difference from binding():

export class Parent {
  async attaching() {
    // This runs in PARALLEL with children!
    await animateIn();
  }
}

Timeline:
Parent.attaching() ────┐
                       ├─ async animation (parallel)
Child activation ──────┤
                       ├─ runs simultaneously
Both complete ─────────┘
  ↓
Parent.attached()
Child.attached()

Note: attaching() and child activation run in parallel


ATTACHED() AWAITS ATTACHING()
═══════════════════════════════════════════════════════════

export class MyComponent {
  async attaching() {
    await animateIn();  // ← Async
  }

  attached() {
    // Only called AFTER attaching() resolves
    console.log('Animation complete!');
  }
}

Timeline:
attaching() ──────┐
                  ├─ await animation
                  └──→ [ animation completes ]
                         ↓
                       attached() ← Called now

This ensures you can safely measure DOM in attached()


DETACHING() PARALLEL BEHAVIOR
═══════════════════════════════════════════════════════════

Detaching hooks await in PARALLEL:

export class Parent {
  async detaching() {
    await this.animateOut();  // 500ms
  }
}

export class Child1 {
  async detaching() {
    await this.animateOut();  // 300ms
  }
}

export class Child2 {
  async detaching() {
    await this.animateOut();  // 400ms
  }
}

Timeline:
Parent.detaching() ────────┐ (500ms)
Child1.detaching() ─────┐  │ (300ms)
Child2.detaching() ──────┤  │ (400ms)
                         │  │
                         │  │ (all run in parallel)
                         │  │
All complete ────────────┴──┘
  ↓ (after 500ms - longest)
removeNodes()
unbinding()

Total time: 500ms (not 1200ms!)


PROMISE REJECTION HANDLING
═══════════════════════════════════════════════════════════

If a lifecycle hook Promise rejects:

export class MyComponent {
  async binding() {
    throw new Error('Failed to load data');
  }
}

Behavior:
ret.catch((err: Error) => {
  this._reject(err);  // Propagates to controller.$promise
});

The activation aborts and the error propagates to the parent.
The component will NOT be activated.


BEST PRACTICES
═══════════════════════════════════════════════════════════

DO use async in attaching() for animations
  (runs in parallel, doesn't block)

DO use async in detaching() for exit animations
  (all run in parallel)

AVOID async in binding() unless necessary
  (blocks all children from starting)

DO use loading() for data fetching
  (router lifecycle, doesn't block children)

AVOID long-running operations in binding()
  (delays entire component tree activation)
```

---

## 5. Common Pitfalls

Real-world mistakes and how to avoid them:

```
PITFALL #1: Memory Leaks from Event Listeners
═══════════════════════════════════════════════════════════

BAD - Leaks memory:
export class MyComponent {
  attached() {
    window.addEventListener('resize', this.handleResize);
  }
  // Missing cleanup!
}

GOOD - Properly cleaned up:
export class MyComponent {
  attached() {
    window.addEventListener('resize', this.handleResize);
  }

  detaching() {
    window.removeEventListener('resize', this.handleResize);
  }
}

BETTER - Use bound method:
export class MyComponent {
  private handleResize = () => { /* ... */ };

  attached() {
    window.addEventListener('resize', this.handleResize);
  }

  detaching() {
    window.removeEventListener('resize', this.handleResize);
  }
}


PITFALL #2: Accessing DOM Before It's Ready
═══════════════════════════════════════════════════════════

BAD - DOM not ready:
export class MyComponent {
  binding() {
    // DOM not attached yet!
    const width = this.element.offsetWidth;  // Might be 0
  }
}

GOOD - Wait for attached:
export class MyComponent {
  attached() {
    // DOM is now in document and laid out
    const width = this.element.offsetWidth;  // Correct!
  }
}

Why: binding() happens before DOM is attached.
Use attached() for DOM measurements.


PITFALL #3: Blocking Children with Slow binding()
═══════════════════════════════════════════════════════════

BAD - Blocks entire tree:
export class Parent {
  async binding() {
    // This delays ALL children for 2 seconds!
    this.data = await slowApiCall();  // 2000ms
  }
}

GOOD - Use loading() or attached():
export class Parent {
  async loading() {
    // Children can start while this runs
    this.data = await slowApiCall();
  }

  binding() {
    // Quick, synchronous setup only
  }
}

Or if not using router:
export class Parent {
  binding() {
    // Synchronous setup
  }

  attached() {
    // Async data loading after activation
    void this.loadData();
  }

  private async loadData() {
    this.data = await slowApiCall();
  }
}


PITFALL #4: Not Awaiting Async Hooks
═══════════════════════════════════════════════════════════

BAD - Missing await:
export class MyComponent {
  detaching() {
    this.animateOut();  // Missing await/return!
  }

  private async animateOut() {
    await animation.play();
  }
}
// Animation cut short because DOM removed immediately!

GOOD - Properly awaited:
export class MyComponent {
  detaching() {
    return this.animateOut();  // Return the Promise
  }

  private async animateOut() {
    await animation.play();
  }
}
// Framework waits for animation before removing DOM


PITFALL #5: Heavy Work in Constructor
═══════════════════════════════════════════════════════════

BAD - Premature work:
export class MyComponent {
  @bindable data: any;

  constructor() {
    // data is undefined! Bindables not set yet
    this.processData(this.data);  // undefined!
  }
}

GOOD - Wait for binding:
export class MyComponent {
  @bindable data: any;

  binding() {
    // Bindables are now set
    this.processData(this.data);  // Correct!
  }
}

Rule: Constructor runs before bindables are set.
Use binding() or later hooks to access bindables.


PITFALL #6: Forgetting dispose() for Long-Lived Resources
═══════════════════════════════════════════════════════════

BAD - Resource leak:
export class MyComponent {
  private subscription: Subscription;

  attached() {
    this.subscription = eventAggregator.subscribe('event', this.handler);
  }

  detaching() {
    this.subscription.dispose();  // Not enough!
  }
}
// If component is cached (repeat.for), subscription persists!

GOOD - Clean up in dispose:
export class MyComponent {
  private subscription: Subscription;

  attached() {
    this.subscription = eventAggregator.subscribe('event', this.handler);
  }

  detaching() {
    // Short-lived cleanup
  }

  dispose() {
    // Permanent cleanup
    this.subscription?.dispose();
  }
}

When to use each:
- detaching(): Temporary deactivation (might reactivate)
- dispose(): Permanent cleanup (never coming back)


PITFALL #7: Modifying @observable During Deactivation
═══════════════════════════════════════════════════════════

BAD - Triggers bindings during teardown:
export class MyComponent {
  @observable isActive: boolean = true;

  unbinding() {
    this.isActive = false;  // Triggers change handlers!
  }
}
// Can cause errors if bindings partially disconnected

GOOD - Set state before unbinding:
export class MyComponent {
  @observable isActive: boolean = true;

  detaching() {
    // Bindings still active, safe to modify
    this.isActive = false;
  }

  unbinding() {
    // Just cleanup, no state changes
  }
}


PITFALL #8: Not Handling Deactivation During Activation
═══════════════════════════════════════════════════════════

BAD - Race condition:
export class MyComponent {
  private data: any;

  async binding() {
    this.data = await fetch('/api/slow');  // 5 seconds
    // User navigates away after 1 second...
    this.doSomething(this.data);  // Component might be gone!
  }
}

GOOD - Check state:
export class MyComponent {
  private data: any;
  private isActive = true;

  async binding() {
    this.data = await fetch('/api/slow');

    if (!this.isActive) {
      return;  // Don't continue if deactivated
    }

    this.doSomething(this.data);
  }

  unbinding() {
    this.isActive = false;
  }
}

BETTER - Use AbortController:
export class MyComponent {
  private abortController = new AbortController();

  async binding() {
    try {
      const data = await fetch('/api/slow', {
        signal: this.abortController.signal
      });
      this.doSomething(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;  // Deactivated, ignore
      }
      throw err;
    }
  }

  unbinding() {
    this.abortController.abort();
  }
}


PITFALL #9: Incorrect Parent-Child Communication Timing
═══════════════════════════════════════════════════════════

BAD - Child calls parent too early:
export class Child {
  @bindable onReady: () => void;

  binding() {
    this.onReady();  // Parent might not be bound yet!
  }
}

GOOD - Wait for attached:
export class Child {
  @bindable onReady: () => void;

  attached() {
    this.onReady();  // Parent is definitely attached
  }
}

Timeline:
Parent.binding()
  -> Child.binding() (Too early to communicate up)
  -> Child.bound()
  -> Parent.bound()
  -> Child.attached() (Safe to communicate up)
  -> Parent.attached()


PITFALL #10: 3rd Party Library Lifecycle Mismatch
═══════════════════════════════════════════════════════════

BAD - Library not ready:
export class ChartComponent {
  binding() {
    // DOM not in document yet!
    this.chart = new Chart(this.canvasElement);  // Might fail
  }
}

GOOD - Initialize in attached:
export class ChartComponent {
  private chart: Chart | null = null;

  attached() {
    // DOM is in document and measured
    this.chart = new Chart(this.canvasElement);
  }

  detaching() {
    // Clean up before DOM removal
    this.chart?.destroy();
    this.chart = null;
  }
}

Many libraries need:
1. Element in DOM (use attached)
2. Measured layout (use attached)
3. Cleanup before removal (use detaching)


QUICK REFERENCE: Which Hook For What?
═══════════════════════════════════════════════════════════

Task                              Hook
─────────────────────────────────────────────────────────
Inject services                   constructor
Access @bindable values           binding or later
Fetch data (router)               loading
Fetch data (no router)            attached
Set up DOM listeners              attached
Initialize 3rd party library      attached
Measure DOM elements              attached
Start animations                  attaching
Exit animations                   detaching
Remove DOM listeners              detaching
Clean up 3rd party library        detaching
Dispose long-lived subscriptions  dispose
Avoid async here                  binding (blocks children)
Async OK here                     attaching, detaching, attached
```

---

## Summary

**Key Takeaways:**
1. **Activation is top-down** until attached (which is bottom-up)
2. **Deactivation is bottom-up** throughout
3. **binding() blocks children**, attaching() doesn't
4. **Stacks coordinate timing** between parent and children
5. **Always clean up** in the opposite hook (attached ↔ detaching)
6. **Use attached()** for DOM work, not binding()

For more details, see the main [Component Lifecycles](./component-lifecycles.md) documentation.
