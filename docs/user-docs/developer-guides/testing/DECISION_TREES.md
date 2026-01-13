# Testing Decision Trees

Visual decision trees to help you choose the right testing approach for your scenario.

## Table of Contents

1. [What Should I Test?](#1-what-should-i-test)
2. [Which Fixture Creation Method?](#2-which-fixture-creation-method)
3. [How Should I Mock Dependencies?](#3-how-should-i-mock-dependencies)
4. [Which Assertion Method?](#4-which-assertion-method)
5. [How to Test Async Behavior?](#5-how-to-test-async-behavior)
6. [Which Lifecycle Hook to Test In?](#6-which-lifecycle-hook-to-test-in)
7. [How to Handle User Interactions?](#7-how-to-handle-user-interactions)

---

## 1. What Should I Test?

```
START: I need to test...
│
├─ Component rendering?
│  │
│  ├─ Static content only?
│  │  └─→ Use assertText() / assertHtml()
│  │      Example: fixture.assertText('Hello World');
│  │
│  ├─ Dynamic content with bindings?
│  │  └─→ Test initial state + binding updates
│  │      Example: component.value = 'new'; assertText('new');
│  │
│  └─ Conditional rendering (if/show)?
│     └─→ Test both shown and hidden states
│         Example: component.show = false; assertHtml('');
│
├─ User interactions?
│  │
│  ├─ Form inputs?
│  │  └─→ See Decision Tree #7
│  │
│  ├─ Button clicks?
│  │  └─→ Use trigger.click()
│  │      Example: trigger.click('button');
│  │
│  └─ Keyboard events?
│     └─→ Use trigger.keydown() / trigger.keyup()
│         Example: trigger.keydown('input', { key: 'Enter' });
│
├─ Component lifecycle?
│  │
│  └─→ Track hook calls with flags
│      Example:
│      const calls = [];
│      class { binding() { calls.push('binding'); } }
│
├─ Data fetching / async operations?
│  │
│  └─→ See Decision Tree #5
│
├─ Component with dependencies?
│  │
│  └─→ See Decision Tree #3
│
├─ Routing behavior?
│  │
│  ├─ Navigation?
│  │  └─→ Test router.load() and currentRoute
│  │
│  ├─ Route parameters?
│  │  └─→ Test params passed to component
│  │
│  └─ Route hooks (canLoad, loading)?
│     └─→ Invoke hooks manually or test via navigation
│
├─ State management?
│  │
│  ├─ Local component state?
│  │  └─→ Test property changes and rendering
│  │
│  ├─ @observable properties?
│  │  └─→ Test propertyChanged() callbacks
│  │      Example:
│  │      component.count = 5;
│  │      expect(component.onCountChanged).toHaveBeenCalled();
│  │
│  └─ Store/global state?
│     └─→ Mock store and test state updates
│
└─ Error handling?
   │
   └─→ Test error state and recovery
       Example:
       await component.load(); // Triggers error
       expect(component.error).toBeTruthy();
```

---

## 2. Which Fixture Creation Method?

```
START: I'm creating a test fixture...
│
├─ Simple inline template + class?
│  │
│  └─→ Use createFixture(template, class, deps)
│      Example:
│      createFixture(
│        '<div>${message}</div>',
│        class { message = 'Hi'; },
│        []
│      )
│
├─ Need to configure before building?
│  │
│  └─→ Use builder pattern with .build()
│      Example:
│      createFixture
│        .component(class App {})
│        .html`<div>Test</div>`
│        .deps(MyService)
│        .build()
│
├─ Testing existing component with template file?
│  │
│  └─→ Create wrapper with your component
│      Example:
│      createFixture
│        .html`<my-component value.bind="test"></my-component>`
│        .component(class { test = 'value'; })
│        .deps(MyComponent)
│        .build()
│
├─ Need to wait for initialization?
│  │
│  ├─ Manual control?
│  │  └─→ Use .build() and await fixture.startPromise
│  │      Example:
│  │      const fixture = createFixture.build();
│  │      // Do setup...
│  │      await fixture.startPromise;
│  │
│  └─ Automatic?
│     └─→ Use .build().started
│         Example:
│         const fixture = await createFixture
│           .html`...`
│           .build()
│           .started;
│
├─ Testing with custom configuration?
│  │
│  └─→ Use .config() in builder
│      Example:
│      createFixture
│        .component(class App {})
│        .config({
│          /* custom Aurelia config */
│        })
│        .build()
│
└─ Testing multiple related components?
   │
   └─→ Register all dependencies
       Example:
       createFixture
         .html`<parent><child></child></parent>`
         .deps(Parent, Child, SharedService)
         .build()
```

---

## 3. How Should I Mock Dependencies?

```
START: I need to mock a dependency...
│
├─ Simple service with few methods?
│  │
│  ├─ Just need a stub?
│  │  └─→ Create inline mock class
│  │      Example:
│  │      class MockService {
│  │        getData() { return 'mock data'; }
│  │      }
│  │      .deps(Registration.instance(IService, new MockService()))
│  │
│  └─ Need to verify calls?
│     └─→ Use createSpy() or track calls manually
│         Example:
│         const spy = createSpy();
│         class MockService {
│           getData = spy;
│         }
│
├─ Complex service with many methods?
│  │
│  ├─ Only mocking some methods?
│  │  └─→ Extend real service, override specific methods
│  │      Example:
│  │      class PartialMock extends RealService {
│  │        getData() { return 'mock'; } // Override
│  │      }
│  │
│  └─ Mocking entire service?
│     └─→ Use provided mock from @aurelia/testing
│         Example:
│         import { MockServiceLocator } from '@aurelia/testing';
│
├─ Need to change mock behavior during test?
│  │
│  └─→ Create mock with changeable state
│      Example:
│      const mockData = { value: 'initial' };
│      class MockService {
│        getData() { return mockData.value; }
│      }
│      // In test:
│      mockData.value = 'changed';
│
├─ Mocking HTTP/Fetch calls?
│  │
│  ├─ Using Aurelia Fetch Client?
│  │  └─→ Mock IHttpClient
│  │      Example:
│  │      class MockHttpClient {
│  │        fetch() { return Promise.resolve(mockResponse); }
│  │      }
│  │
│  └─ Using native fetch?
│     └─→ Mock global fetch
│         Example:
│         global.fetch = jest.fn(() =>
│           Promise.resolve({
│             json: () => Promise.resolve(mockData)
│           })
│         );
│
├─ Mocking Event Aggregator?
│  │
│  └─→ Track subscriptions and publishes
│      Example:
│      const published = [];
│      class MockEA {
│        publish(event, data) { published.push({ event, data }); }
│        subscribe() { return { dispose: () => {} }; }
│      }
│
└─ Mocking Router?
   │
   └─→ Mock IRouter with navigation tracking
       Example:
       const navigations = [];
       class MockRouter {
         load(path) {
           navigations.push(path);
           return Promise.resolve(true);
         }
       }
```

---

## 4. Which Assertion Method?

```
START: I want to assert...
│
├─ Text content?
│  │
│  ├─ Exact match of entire element?
│  │  └─→ assertText(text)
│  │      Example: assertText('Expected text');
│  │
│  ├─ Exact match of specific element?
│  │  └─→ assertText(selector, text)
│  │      Example: assertText('.title', 'Page Title');
│  │
│  ├─ Contains substring?
│  │  └─→ assertTextContain(text)
│  │      Example: assertTextContain('partial');
│  │
│  └─ Complex text verification?
│     └─→ Use getBy() + expect()
│         Example: expect(getBy('.el').textContent).toMatch(/regex/);
│
├─ HTML structure?
│  │
│  ├─ Exact innerHTML?
│  │  └─→ assertHtml(html)
│  │      Example: assertHtml('<div>Content</div>');
│  │
│  └─ Specific element's innerHTML?
│     └─→ assertHtml(selector, html)
│         Example: assertHtml('.container', '<span>Text</span>');
│
├─ CSS classes?
│  │
│  ├─ Has specific classes (can have others)?
│  │  └─→ assertClass(selector, ...classes)
│  │      Example: assertClass('.btn', 'active', 'primary');
│  │
│  └─ Has ONLY these classes?
│     └─→ assertClassStrict(selector, ...classes)
│         Example: assertClassStrict('.btn', 'active');
│
├─ Attributes?
│  │
│  ├─ Regular attribute?
│  │  └─→ assertAttr(selector, name, value)
│  │      Example: assertAttr('a', 'href', '/home');
│  │
│  └─ Namespaced attribute (SVG, XML)?
│     └─→ assertAttrNS(selector, ns, name, value)
│         Example: assertAttrNS('svg', 'http://...', 'viewBox', '0 0 100 100');
│
├─ Styles?
│  │
│  ├─ Computed styles?
│  │  └─→ assertStyles(selector, { prop: value })
│  │      Example: assertStyles('.el', { color: 'rgb(255, 0, 0)' });
│  │
│  └─ Inline styles?
│     └─→ Use getBy() + check style attribute
│         Example: expect(getBy('.el').style.color).toBe('red');
│
├─ Form values?
│  │
│  ├─ Input/textarea value?
│  │  └─→ assertValue(selector, value)
│  │      Example: assertValue('input', 'john');
│  │
│  └─ Checkbox/radio checked state?
│     └─→ assertChecked(selector, boolean)
│         Example: assertChecked('input[type=checkbox]', true);
│
├─ DOM state?
│  │
│  ├─ Element exists?
│  │  └─→ Use getBy() (throws if not found)
│  │      Example: expect(() => getBy('.el')).not.toThrow();
│  │
│  ├─ Element might not exist?
│  │  └─→ Use queryBy() (returns null)
│  │      Example: expect(queryBy('.optional')).toBeNull();
│  │
│  └─ Multiple elements?
│     └─→ Use getAllBy()
│         Example: expect(getAllBy('.item').length).toBe(3);
│
└─ Component state?
   │
   └─→ Access component directly
       Example: expect(fixture.component.value).toBe('test');
```

---

## 5. How to Test Async Behavior?

```
START: My component does async work...
│
├─ In which lifecycle hook?
│  │
│  ├─ binding() / bound()?
│  │  └─→ Await .started (hooks complete before started resolves)
│  │      Example:
│  │      const fixture = await createFixture
│  │        .component(class { async binding() { /* ... */ } })
│  │        .build()
│  │        .started;
│  │      // binding() already complete here
│  │
│  ├─ attaching() / attached()?
│  │  └─→ Await .started (attaching awaited, attached called after)
│  │      Example:
│  │      const fixture = await createFixture
│  │        .component(class { async attached() { /* ... */ } })
│  │        .build()
│  │        .started;
│  │      // attached() already complete here
│  │
│  └─ Custom method?
│     └─→ Await the method directly
│         Example:
│         await component.loadData();
│         expect(component.data).toBeTruthy();
│
├─ Using Promises?
│  │
│  ├─ Need to wait for specific promise?
│  │  └─→ Await the promise
│  │      Example:
│  │      const result = await component.fetchData();
│  │      expect(result).toBe('data');
│  │
│  └─ Testing promise rejection?
│     └─→ Use try/catch or expect().rejects
│         Example:
│         await expect(component.failingMethod()).rejects.toThrow();
│
├─ Using task queue?
│  │
│  ├─ Single task?
│  │  └─→ Await tasksSettled()
│  │      Example:
│  │      component.queueUpdate();
│  │      await tasksSettled();
│  │      assertText('updated');
│  │
│  └─ Multiple tasks?
│     └─→ Keep yielding until complete
│         Example:
│         await tasksSettled();
│
├─ Using setTimeout/setInterval?
│  │
│  ├─ With Jest?
│  │  └─→ Use jest.useFakeTimers()
│  │      Example:
│  │      jest.useFakeTimers();
│  │      component.startTimer();
│  │      jest.advanceTimersByTime(1000);
│  │      expect(component.ticks).toBe(1);
│  │
│  └─ With real timers?
│     └─→ Use Promise + setTimeout
│         Example:
│         await new Promise(resolve => setTimeout(resolve, 100));
│         expect(component.data).toBeTruthy();
│
├─ Waiting for DOM updates?
│  │
│  └─→ Await tasksSettled();
│      Example:
│      component.items.push('new');
│      await tasksSettled();
│      assertText('new');
│
└─ Testing loading states?
   │
   └─→ Test before and after async completion
       Example:
       const loadPromise = component.loadData();
       expect(component.loading).toBe(true); // Before
       await loadPromise;
       expect(component.loading).toBe(false); // After
       expect(component.data).toBeTruthy();
```

---

## 6. Which Lifecycle Hook to Test In?

```
START: When should I test...
│
├─ Initial component state?
│  │
│  └─→ After .started (all hooks complete)
│      Example:
│      const fixture = await createFixture.build().started;
│      expect(fixture.component.initialized).toBe(true);
│
├─ Bindable property setting?
│  │
│  └─→ In binding() or later
│      Bindables are set before binding()
│      Example:
│      class {
│        @bindable value;
│        binding() {
│          // value is available here
│        }
│      }
│
├─ DOM measurements?
│  │
│  └─→ In attached() or later
│      DOM is in document and laid out
│      Example:
│      class {
│        attached() {
│          this.width = this.element.offsetWidth; // Valid
│        }
│      }
│
├─ Event listener setup?
│  │
│  └─→ In attached()
│      Example:
│      class {
│        attached() {
│          this.element.addEventListener('click', this.handler);
│        }
│        detaching() {
│          this.element.removeEventListener('click', this.handler);
│        }
│      }
│
├─ Data fetching?
│  │
│  ├─ With router?
│  │  └─→ In loading() hook (router lifecycle)
│  │      Example:
│  │      class {
│  │        async loading(params) {
│  │          this.data = await fetch(`/api/${params.id}`);
│  │        }
│  │      }
│  │
│  └─ Without router?
│     └─→ In attached() or custom method
│         Example:
│         class {
│           async attached() {
│             await this.loadData();
│           }
│         }
│
├─ Cleanup/disposal?
│  │
│  ├─ Temporary (might reactivate)?
│  │  └─→ In detaching()
│  │      Example:
│  │      class {
│  │        detaching() {
│  │          this.stopAnimation();
│  │        }
│  │      }
│  │
│  └─ Permanent (never reactivates)?
│     └─→ In dispose()
│         Example:
│         class {
│           dispose() {
│             this.subscription.dispose();
│           }
│         }
│
└─ Observing property changes?
   │
   └─→ Use @observable with propertyChanged callback
       Example:
       class {
         @observable count = 0;
         countChanged(newValue, oldValue) {
           this.logChange(newValue, oldValue);
         }
       }
```

---

## 7. How to Handle User Interactions?

```
START: I need to simulate...
│
├─ Clicking?
│  │
│  ├─ Simple click?
│  │  └─→ trigger.click(selector)
│  │      Example:
│  │      trigger.click('button');
│  │      expect(component.clicked).toBe(true);
│  │
│  └─ Click with event options?
│     └─→ trigger.click(selector, init)
│         Example:
│         trigger.click('button', { bubbles: true });
│
├─ Typing text?
│  │
│  ├─ Single input?
│  │  └─→ type(selector, value)
│  │      Example:
│  │      type('input', 'hello');
│  │      expect(component.value).toBe('hello');
│  │
│  └─ Multiple characters with events?
│     └─→ Trigger keydown/keyup for each
│         Example:
│         for (const char of 'hello') {
│           trigger.keydown('input', { key: char });
│           trigger.keyup('input', { key: char });
│         }
│
├─ Keyboard shortcuts?
│  │
│  └─→ trigger.keydown(selector, { key, code, ... })
│      Example:
│      trigger.keydown('input', { key: 'Enter', code: 'Enter' });
│      trigger.keydown('textarea', { key: 'Escape' });
│      trigger.keydown('input', { key: 's', ctrlKey: true }); // Ctrl+S
│
├─ Form interactions?
│  │
│  ├─ Text input?
│  │  └─→ type() + verify binding
│  │      Example:
│  │      type('input[name="email"]', 'user@example.com');
│  │      expect(component.email).toBe('user@example.com');
│  │
│  ├─ Checkbox?
│  │  └─→ trigger.click()
│  │      Example:
│  │      trigger.click('input[type="checkbox"]');
│  │      expect(component.agreed).toBe(true);
│  │
│  ├─ Radio button?
│  │  └─→ trigger.click()
│  │      Example:
│  │      trigger.click('input[value="option2"]');
│  │      expect(component.choice).toBe('option2');
│  │
│  ├─ Select dropdown?
│  │  └─→ Set value + trigger change
│  │      Example:
│  │      const select = getBy('select');
│  │      select.value = 'option2';
│  │      trigger.change('select');
│  │      expect(component.selected).toBe('option2');
│  │
│  └─ Form submission?
│     └─→ trigger('form', 'submit')
│         Example:
│         trigger('form', 'submit');
│         expect(component.submitted).toBe(true);
│
├─ Mouse events?
│  │
│  └─→ Use trigger.mousedown/mouseup/etc with init options
│      Example:
│      trigger.mousedown('.draggable', {
│        clientX: 100,
│        clientY: 100
│      });
│
├─ Scroll events?
│  │
│  └─→ Use scrollBy helper
│      Example:
│      scrollBy('.scrollable', { top: 100 });
│      expect(component.scrolled).toBe(true);
│
├─ Custom events?
│  │
│  └─→ Use createEvent + trigger
│      Example:
│      const event = createEvent('my-event', {
│        detail: { data: 'test' }
│      });
│      trigger('.element', event);
│      expect(component.eventData).toBe('test');
│
└─ Focus/blur?
   │
   └─→ Use element.focus() / element.blur() + trigger
       Example:
       const input = getBy('input');
       input.focus();
       trigger('input', 'focus');
       expect(component.focused).toBe(true);
```

---

## 8. Should I Write a Unit Test or Integration Test?

```
START: What type of test should I write?
│
├─ Testing pure logic (no DOM, no Aurelia)?
│  │
│  └─→ UNIT TEST (no fixture needed)
│      Example:
│      class Calculator {
│        add(a, b) { return a + b; }
│      }
│
│      test('adds numbers', () => {
│        const calc = new Calculator();
│        expect(calc.add(2, 3)).toBe(5);
│      });
│
├─ Testing service with no dependencies?
│  │
│  └─→ UNIT TEST (instantiate directly)
│      Example:
│      class DataService {
│        getData() { return ['a', 'b']; }
│      }
│
│      test('returns data', () => {
│        const service = new DataService();
│        expect(service.getData()).toEqual(['a', 'b']);
│      });
│
├─ Testing service with dependencies?
│  │
│  ├─ Dependencies are simple?
│  │  └─→ UNIT TEST with mocks
│  │      Example:
│  │      class UserService {
│  │        constructor(private http: HttpClient) {}
│  │        getUser(id) { return this.http.get(`/users/${id}`); }
│  │      }
│  │
│  │      test('fetches user', () => {
│  │        const mockHttp = { get: jest.fn(() => Promise.resolve({})) };
│  │        const service = new UserService(mockHttp);
│  │        service.getUser(1);
│  │        expect(mockHttp.get).toHaveBeenCalledWith('/users/1');
│  │      });
│  │
│  └─ Dependencies are complex/many?
│     └─→ INTEGRATION TEST with fixture
│         Use createFixture with DI container
│
├─ Testing component rendering?
│  │
│  └─→ INTEGRATION TEST (need template + binding)
│      Example:
│      const fixture = await createFixture
│        .html`<div>${message}</div>`
│        .component(class { message = 'Hi'; })
│        .build()
│        .started;
│      fixture.assertText('Hi');
│
├─ Testing component + child components?
│  │
│  └─→ INTEGRATION TEST (test hierarchy)
│      Example:
│      const fixture = await createFixture
│        .html`<parent><child></child></parent>`
│        .deps(Parent, Child)
│        .build()
│        .started;
│
├─ Testing custom attribute?
│  │
│  └─→ INTEGRATION TEST (need host element)
│      Example:
│      const fixture = await createFixture
│        .html`<div my-attr.bind="value"></div>`
│        .component(class { value = 'test'; })
│        .deps(MyAttr)
│        .build()
│        .started;
│
├─ Testing value converter?
│  │
│  ├─ Simple transformation (no dependencies)?
│  │  └─→ UNIT TEST (call toView/fromView directly)
│  │      Example:
│  │      class UppercaseValueConverter {
│  │        toView(value) { return value.toUpperCase(); }
│  │      }
│  │
│  │      test('uppercases', () => {
│  │        const vc = new UppercaseValueConverter();
│  │        expect(vc.toView('hello')).toBe('HELLO');
│  │      });
│  │
│  └─ Complex transformation (with dependencies)?
│     └─→ INTEGRATION TEST (test in binding)
│         Example:
│         const fixture = await createFixture
│           .html`<div>${value | myConverter}</div>`
│           .deps(MyConverter, dependencies...)
│           .build()
│           .started;
│
└─ Testing routing behavior?
   │
   └─→ INTEGRATION TEST (need router + components)
       Example:
       const fixture = await createFixture
         .component(class App {
           static routes = [{ path: 'home', component: Home }];
         })
         .html`<au-viewport></au-viewport>`
         .deps(Home)
         .build()
         .started;
```

---

## Summary

These decision trees should help you:

1. **Choose what to test** based on your requirements
2. **Select the right fixture creation method** for your scenario
3. **Mock dependencies appropriately** based on complexity
4. **Use the correct assertion method** for your verification
5. **Handle async behavior** correctly
6. **Test in the right lifecycle hook** for your needs
7. **Simulate user interactions** accurately
8. **Decide between unit and integration tests**

For more detailed information, see:
- [Testing Quick Reference](README.md)
- [Testing Components](testing-components.md)
- [Fluent API](fluent-api.md)
- [Mocks and Spies](mocks-spies.md)
