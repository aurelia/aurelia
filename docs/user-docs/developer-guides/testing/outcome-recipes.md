---
description: Advanced testing patterns for complex scenarios including async operations, routing, service mocking, and end-to-end component interaction testing.
---

# Testing Outcome Recipes

These recipes show how to test complex real-world scenarios in Aurelia applications. Use them when basic component testing isn't enough.

## 1. Testing components with async API calls

**Goal:** Test components that load data from APIs with proper handling of loading states, successful responses, and error scenarios.

### Steps

1. Create a mock HTTP client with configurable responses:
   ```typescript
   import { IHttpClient } from '@aurelia/fetch-client';
   import { Registration } from '@aurelia/kernel';

   export class MockHttpClient implements IHttpClient {
     private mockResponses = new Map<string, any>();
     private mockErrors = new Map<string, Error>();

     baseUrl = '';
     activeRequestCount = 0;
     isRequesting = false;

     configure() {
       return this;
     }

     setMockResponse(url: string, data: any, status: number = 200) {
       this.mockResponses.set(url, { data, status });
     }

     setMockError(url: string, error: Error) {
       this.mockErrors.set(url, error);
     }

     async fetch(input: RequestInfo | Request): Promise<Response> {
       const url = typeof input === 'string' ? input : input.url;

       if (this.mockErrors.has(url)) {
         throw this.mockErrors.get(url);
       }

       const mock = this.mockResponses.get(url);
       if (!mock) {
         throw new Error(`No mock response configured for ${url}`);
       }

       return new Response(JSON.stringify(mock.data), {
         status: mock.status,
         headers: { 'Content-Type': 'application/json' }
       });
     }
   }

   export const MockHttpClientRegistration = Registration.instance(
     IHttpClient,
     new MockHttpClient()
   );
   ```

2. Test component with successful data loading:
   ```typescript
   import { createFixture } from '@aurelia/testing';
   import { MockHttpClient, MockHttpClientRegistration } from './mock-http-client';
   import { ProductList } from './product-list';

   describe('ProductList', () => {
     it('should load and display products', async () => {
       const mockHttp = new MockHttpClient();
       mockHttp.setMockResponse('/api/products', {
         products: [
           { id: '1', name: 'Product 1', price: 10 },
           { id: '2', name: 'Product 2', price: 20 }
         ]
       });

       const { component, assertText, platform } = await createFixture
         .component(ProductList)
         .html`<div>
           <div if.bind="loading">Loading...</div>
           <div if.bind="error">\${error}</div>
           <div repeat.for="product of products">\${product.name}</div>
         </div>`
         .deps(Registration.instance(IHttpClient, mockHttp))
         .build()
         .started;

       // Initial loading state
       assertText('Loading...');

       // Wait for async attached() to complete
       await tasksSettled();

       // Verify products are displayed
       assertText('Product 1Product 2');
       expect(component.loading).toBe(false);
       expect(component.products.length).toBe(2);

       await fixture.stop(true);
     });
   });
   ```

3. Test error handling:
   ```typescript
   it('should display error message when API fails', async () => {
     const mockHttp = new MockHttpClient();
     mockHttp.setMockError('/api/products', new Error('Network error'));

     const { component, assertText, platform } = await createFixture
       .component(ProductList)
       .html`<div>
         <div if.bind="loading">Loading...</div>
         <div if.bind="error">\${error}</div>
         <div repeat.for="product of products">\${product.name}</div>
       </div>`
       .deps(Registration.instance(IHttpClient, mockHttp))
       .build()
       .started;

     // Wait for async operation
     await tasksSettled();

     // Verify error is displayed
     expect(component.error).toBeTruthy();
     expect(component.products.length).toBe(0);
     expect(component.loading).toBe(false);

     await fixture.stop(true);
   });
   ```

4. Test retry functionality:
   ```typescript
   it('should retry loading when retry button is clicked', async () => {
     const mockHttp = new MockHttpClient();
     let callCount = 0;

     // First call fails, second succeeds
     mockHttp.fetch = async (input: RequestInfo | Request) => {
       callCount++;
       if (callCount === 1) {
         throw new Error('Temporary error');
       }
       return new Response(JSON.stringify({
         products: [{ id: '1', name: 'Product 1', price: 10 }]
       }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     };

     const { component, trigger, assertText, platform } = await createFixture
       .component(ProductList)
       .html`<div>
         <div if.bind="loading">Loading...</div>
         <div if.bind="error">
           \${error}
           <button click.trigger="retry()">Retry</button>
         </div>
         <div repeat.for="product of products">\${product.name}</div>
       </div>`
       .deps(Registration.instance(IHttpClient, mockHttp))
       .build()
       .started;

     // Wait for initial failed load
     await tasksSettled();
     expect(component.error).toBeTruthy();

     // Click retry button
     trigger.click('button');

     // Wait for retry to complete
     await tasksSettled();

     // Verify success
     assertText('Product 1');
     expect(component.error).toBeNull();
     expect(callCount).toBe(2);

     await fixture.stop(true);
   });
   ```

### Checklist

- Loading state displays before data arrives
- Successful API calls populate component data
- Error states are handled and displayed
- Retry functionality reloads data
- All async operations can be waited using `await tasksSettled()` for timing

## 2. Testing router navigation and route parameters

**Goal:** Test components that use routing for navigation, parameter extraction, and route guards.

### Steps

1. Set up a test with router configuration:
   ```typescript
   import { createFixture } from '@aurelia/testing';
   import { IRouter, RouterConfiguration } from '@aurelia/router';
   import { ProductDetail } from './product-detail';
   import { ProductList } from './product-list';

   describe('Router navigation', () => {
     it('should navigate to product detail with correct parameter', async () => {
        const { component, container, platform } = await createFixture
          .component(class App {
            static routes = [
              { path: '', redirect: 'products' },
              { path: 'products', component: ProductList, title: 'Products' },
              { path: 'products/:id', component: ProductDetail, title: 'Product' }
            ];
          })
          .html`<au-viewport></au-viewport>`
          .deps(RouterConfiguration, ProductList, ProductDetail)
          .build()
          .started;

        const router = container.get(IRouter);

        // Navigate to product detail
        await router.load('products/123');
        await tasksSettled();

        // Verify navigation occurred
        expect(router.currentRoute?.path).toContain('products/123');

        await fixture.stop(true);
      });
   });
   ```

2. Test route parameter extraction:
   ```typescript
   it('should extract and use route parameters', async () => {
     let loadedProductId: string | null = null;

     class TestProductDetail {
       productId: string = '';

       loading(params: any) {
         this.productId = params.id;
         loadedProductId = params.id;
       }
     }

     const { container, platform } = await createFixture
       .component(class App {
         static routes = [
           { path: 'products/:id', component: TestProductDetail }
         ];
       })
       .html`<au-viewport></au-viewport>`
       .deps(RouterConfiguration, TestProductDetail)
       .build()
       .started;

     const router = container.get(IRouter);

     // Navigate with parameter
     await router.load('products/456');
     await tasksSettled();

     // Verify parameter was extracted
     expect(loadedProductId).toBe('456');

     await fixture.stop(true);
   });
   ```

3. Test route guards:
   ```typescript
   it('should prevent navigation when canLoad returns false', async () => {
     let canLoadCalled = false;
     let componentLoaded = false;

     class ProtectedComponent {
       canLoad() {
         canLoadCalled = true;
         return false; // Deny navigation
       }

       loading() {
         componentLoaded = true;
       }
     }

     const { container, platform } = await createFixture
       .component(class App {
         static routes = [
           { path: '', component: class Home {} },
           { path: 'protected', component: ProtectedComponent }
         ];
       })
       .html`<au-viewport></au-viewport>`
       .deps(RouterConfiguration, ProtectedComponent)
       .build()
       .started;

     const router = container.get(IRouter);

     // Attempt to navigate to protected route
     await router.load('protected');
     await tasksSettled();

     // Verify navigation was blocked
     expect(canLoadCalled).toBe(true);
     expect(componentLoaded).toBe(false);
     expect(router.currentRoute?.path).not.toContain('protected');

     await fixture.stop(true);
   });
   ```

4. Test route guard redirects:
   ```typescript
   it('should redirect when canLoad returns a different path', async () => {
     class AuthGuard {
       canLoad() {
         // Simulate unauthenticated user
         return '/login'; // Redirect
       }
     }

     class LoginPage {
       loaded = false;
       loading() {
         this.loaded = true;
       }
     }

     const { container, platform } = await createFixture
       .component(class App {
         static routes = [
           { path: 'dashboard', component: AuthGuard },
           { path: 'login', component: LoginPage }
         ];
       })
       .html`<au-viewport></au-viewport>`
       .deps(RouterConfiguration, AuthGuard, LoginPage)
       .build()
       .started;

     const router = container.get(IRouter);

     // Try to access protected route
     await router.load('dashboard');
     await tasksSettled();

     // Verify redirect to login
     expect(router.currentRoute?.path).toContain('login');

     await fixture.stop(true);
   });
   ```

### Checklist

- Router navigation works in tests
- Route parameters are extracted correctly
- `canLoad` guards are invoked and respected
- Redirects from guards work as expected
- Current route state is verifiable

## 3. Testing with validation

**Goal:** Test form validation including rules, error display, and submission prevention.

### Steps

1. Set up validation testing environment:
   ```typescript
   import { createFixture } from '@aurelia/testing';
   import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
   import { IValidationRules } from '@aurelia/validation';
   import { IValidationController } from '@aurelia/validation-html';
   import { newInstanceForScope, resolve } from '@aurelia/kernel';

   describe('Form validation', () => {
     it('should validate required fields and show errors', async () => {
       class SignupForm {
         user = { email: '', password: '' };
         controller = resolve(newInstanceForScope(IValidationController));

         constructor(private rules = resolve(IValidationRules)) {
           this.rules
             .on(this.user)
             .ensure('email')
               .required().withMessage('Email is required')
               .email().withMessage('Email must be valid')
             .ensure('password')
               .required().withMessage('Password is required')
               .minLength(8).withMessage('Password must be at least 8 characters');
         }

         async submit() {
           const result = await this.controller.validate();
           return result.valid;
         }
       }

       const { component, platform } = await createFixture
         .component(SignupForm)
         .html`<div>
           <div validation-errors.from-view="emailErrors">
             <input value.bind="user.email & validate:manual">
             <span repeat.for="error of emailErrors">\${error.result.message}</span>
           </div>
           <div validation-errors.from-view="passwordErrors">
             <input value.bind="user.password & validate:manual">
             <span repeat.for="error of passwordErrors">\${error.result.message}</span>
           </div>
         </div>`
         .deps(ValidationHtmlConfiguration)
         .build()
         .started;

       // Submit without filling form
       const isValid = await component.submit();
        await tasksSettled();

       // Verify validation failed
       expect(isValid).toBe(false);
       expect(component.controller.results.length).toBe(2); // Two errors

       await fixture.stop(true);
     });
   });
   ```

2. Test validation with valid input:
   ```typescript
   it('should pass validation with valid input', async () => {
     class SignupForm {
       user = { email: 'test@example.com', password: 'SecurePass123' };
       controller = resolve(newInstanceForScope(IValidationController));

       constructor(private rules = resolve(IValidationRules)) {
         this.rules
           .on(this.user)
           .ensure('email').required().email()
           .ensure('password').required().minLength(8);
       }

       async submit() {
         const result = await this.controller.validate();
         return result.valid;
       }
     }

     const { component, platform } = await createFixture
       .component(SignupForm)
       .html`<div>
         <input value.bind="user.email & validate:manual">
         <input value.bind="user.password & validate:manual">
       </div>`
       .deps(ValidationHtmlConfiguration)
       .build()
       .started;

     // Submit with valid data
     const isValid = await component.submit();
     await tasksSettled();

     // Verify validation passed
     expect(isValid).toBe(true);
     expect(component.controller.results.length).toBe(0);

     await fixture.stop(true);
   });
   ```

3. Test field-level validation on blur:
   ```typescript
   it('should validate individual fields on blur', async () => {
     class FormComponent {
       user = { email: '' };
       controller = resolve(newInstanceForScope(IValidationController));

       constructor(private rules = resolve(IValidationRules)) {
         this.rules
           .on(this.user)
           .ensure('email').required().email();
       }
     }

     const { component, type, trigger, getBy, platform } = await createFixture
       .component(FormComponent)
       .html`<div validation-errors.from-view="emailErrors">
         <input id="email" value.bind="user.email & validate:blur">
         <span repeat.for="error of emailErrors">\${error.result.message}</span>
       </div>`
       .deps(ValidationHtmlConfiguration)
       .build()
       .started;

     // Type invalid email
     type('#email', 'invalid-email');

     // Trigger blur event
     trigger('#email', 'blur');
     await tasksSettled();

     // Verify validation error appears
     const results = component.controller.results;
     expect(results.length).toBeGreaterThan(0);
     expect(results[0].valid).toBe(false);

     await fixture.stop(true);
   });
   ```

### Checklist

- Validation rules are checked on submit
- Invalid data prevents form submission
- Valid data passes validation
- Field-level validation triggers on blur
- Error messages are accessible via controller

## 4. Testing complex component interactions

**Goal:** Test parent-child component communication, custom events, and state synchronization.

### Steps

1. Test parent-child data binding:
   ```typescript
   import { createFixture } from '@aurelia/testing';
   import { bindable } from '@aurelia/runtime-html';

   describe('Component interactions', () => {
     it('should pass data from parent to child via bindable', async () => {
       class ChildComponent {
         @bindable value: string = '';
       }

       class ParentComponent {
         message = 'Hello from parent';
       }

       const { component, getBy, platform } = await createFixture
         .component(ParentComponent)
         .html`<div>
           <child-component value.bind="message"></child-component>
         </div>`
         .deps(ChildComponent)
         .build()
         .started;

       await tasksSettled();

       // Get child component instance
       const childElement = getBy('child-component');
       const childComponent = childElement.au?.controller?.viewModel;

       // Verify data was passed to child
       expect(childComponent.value).toBe('Hello from parent');

       // Update parent data
       component.message = 'Updated message';
       await tasksSettled();

       // Verify child received update
       expect(childComponent.value).toBe('Updated message');

       await fixture.stop(true);
     });
   });
   ```

2. Test child-to-parent communication via custom events:
   ```typescript
   it('should emit custom events from child to parent', async () => {
     class ChildComponent {
       sendMessage() {
         this.dispatchCustomEvent('message-sent', { text: 'Hello parent!' });
       }

       private dispatchCustomEvent(name: string, detail: any) {
         const event = new CustomEvent(name, { detail, bubbles: true });
         this.element.dispatchEvent(event);
       }
     }

     class ParentComponent {
       receivedMessage = '';

       handleMessage(event: CustomEvent) {
         this.receivedMessage = event.detail.text;
       }
     }

     const { component, trigger, platform } = await createFixture
       .component(ParentComponent)
       .html`<div>
         <child-component message-sent.trigger="handleMessage($event)"></child-component>
       </div>`
       .deps(ChildComponent)
       .build()
       .started;

     // Trigger child method that dispatches event
     const childElement = fixture.getBy('child-component');
     const childComponent = childElement.au?.controller?.viewModel;

     childComponent.sendMessage();
     await tasksSettled();

     // Verify parent received message
     expect(component.receivedMessage).toBe('Hello parent!');

     await fixture.stop(true);
   });
   ```

3. Test sibling component communication via shared service:
   ```typescript
   it('should synchronize state between siblings via service', async () => {
     class SharedState {
       @observable count = 0;

       increment() {
         this.count++;
       }
     }

     class ComponentA {
       private state = resolve(SharedState);

       increment() {
         this.state.increment();
       }

       get count() {
         return this.state.count;
       }
     }

     class ComponentB {
       private state = resolve(SharedState);

       get count() {
         return this.state.count;
       }
     }

     const { getBy, trigger, platform } = await createFixture
       .component(class App {})
       .html`<div>
         <component-a></component-a>
         <component-b></component-b>
       </div>`
       .deps(SharedState, ComponentA, ComponentB)
       .build()
       .started;

     const compA = getBy('component-a').au?.controller?.viewModel;
     const compB = getBy('component-b').au?.controller?.viewModel;

     // Initial state
     expect(compA.count).toBe(0);
     expect(compB.count).toBe(0);

     // Increment from component A
     compA.increment();
     await tasksSettled();

     // Verify both components reflect the change
     expect(compA.count).toBe(1);
     expect(compB.count).toBe(1);

     await fixture.stop(true);
   });
   ```

### Checklist

- Parent-to-child data flows via `@bindable`
- Child-to-parent communication works via events
- Sibling components share state via services
- Changes propagate correctly across component tree
- Custom events are dispatched and handled

## 5. Testing lifecycle hooks in complex scenarios

**Goal:** Test components with complex initialization, async lifecycle hooks, and cleanup operations.

### Steps

1. Test async data loading in lifecycle hooks:
   ```typescript
   import { createFixture } from '@aurelia/testing';

   describe('Lifecycle hooks', () => {
     it('should complete async attached hook before rendering', async () => {
       let attachedCompleted = false;
       const loadedData = { id: 1, name: 'Test' };

       class AsyncComponent {
         data: any = null;

         async attached() {
           // Simulate API call
           await new Promise(resolve => setTimeout(resolve, 10));
           this.data = loadedData;
           attachedCompleted = true;
         }
       }

       const { component, assertText } = await createFixture
         .component(AsyncComponent)
         .html`<div>\${data?.name || 'Loading...'}</div>`
         .build()
         .started; // .started waits for all async lifecycle hooks

       // By the time .started resolves, attached() should be complete
       expect(attachedCompleted).toBe(true);
       expect(component.data).toEqual(loadedData);
       assertText('Test');

       await fixture.stop(true);
     });
   });
   ```

2. Test cleanup in detaching/unbinding:
   ```typescript
   it('should cleanup resources in detaching hook', async () => {
     let cleanupCalled = false;
     let subscriptionActive = true;

     class ComponentWithCleanup {
       private intervalId: number | null = null;

       attached() {
         // Simulate subscription or interval
         this.intervalId = window.setInterval(() => {
           // Do something
         }, 1000);
         subscriptionActive = true;
       }

       detaching() {
         // Cleanup
         if (this.intervalId !== null) {
           window.clearInterval(this.intervalId);
           subscriptionActive = false;
           cleanupCalled = true;
         }
       }
     }

     const fixture = await createFixture
       .component(ComponentWithCleanup)
       .html`<div>Content</div>`
       .build()
       .started;

     expect(subscriptionActive).toBe(true);

     // Stop the fixture (triggers detaching)
     await fixture.stop(true);

     // Verify cleanup was called
     expect(cleanupCalled).toBe(true);
     expect(subscriptionActive).toBe(false);
   });
   ```

3. Test lifecycle hook order:
   ```typescript
   it('should execute lifecycle hooks in correct order', async () => {
     const hookCalls: string[] = [];

     class LifecycleComponent {
       binding() {
         hookCalls.push('binding');
       }

       bound() {
         hookCalls.push('bound');
       }

       attaching() {
         hookCalls.push('attaching');
       }

       attached() {
         hookCalls.push('attached');
       }

       detaching() {
         hookCalls.push('detaching');
       }

       unbinding() {
         hookCalls.push('unbinding');
       }
     }

     const fixture = await createFixture
       .component(LifecycleComponent)
       .html`<div>Test</div>`
       .build()
       .started;

     // Verify initialization order
     expect(hookCalls).toEqual([
       'binding',
       'bound',
       'attaching',
       'attached'
     ]);

     hookCalls.length = 0; // Clear array

     await fixture.stop(true);

     // Verify cleanup order
     expect(hookCalls).toEqual([
       'detaching',
       'unbinding'
     ]);
   });
   ```

### Checklist

- Async lifecycle hooks complete before component is ready
- Cleanup hooks properly dispose of resources
- Hook execution order is correct
- `.started` waits for all async hooks to complete
- `stop(true)` triggers cleanup hooks

## 6. Testing with real-world dependencies

**Goal:** Test components that depend on multiple services, handle complex state, and integrate with external systems.

### Steps

1. Create comprehensive mocks for service dependencies:
   ```typescript
   import { Registration } from '@aurelia/kernel';

   // Mock services
   class MockAuthService {
     isAuthenticated = true;
     currentUser = { id: '1', name: 'Test User' };

     async login(email: string, password: string) {
       return email === 'test@example.com' && password === 'password';
     }

     logout() {
       this.isAuthenticated = false;
       this.currentUser = null;
     }
   }

   class MockApiService {
     private responses = new Map<string, any>();

     setResponse(endpoint: string, data: any) {
       this.responses.set(endpoint, data);
     }

     async get(endpoint: string) {
       if (!this.responses.has(endpoint)) {
         throw new Error(`No mock data for ${endpoint}`);
       }
       return this.responses.get(endpoint);
     }

     async post(endpoint: string, data: any) {
       return { success: true, data };
     }
   }

   class MockNotificationService {
     notifications: Array<{ type: string; message: string }> = [];

     success(message: string) {
       this.notifications.push({ type: 'success', message });
     }

     error(message: string) {
       this.notifications.push({ type: 'error', message });
     }

     clear() {
       this.notifications = [];
     }
   }
   ```

2. Test component with multiple service dependencies:
   ```typescript
   import { resolve } from '@aurelia/kernel';

   describe('Complex component integration', () => {
     it('should coordinate multiple services for user dashboard', async () => {
       class UserDashboard {
         private auth = resolve(AuthService);
         private api = resolve(ApiService);
         private notifications = resolve(NotificationService);

         userData: any = null;
         loading = false;
         error: string | null = null;

         async attached() {
           if (!this.auth.isAuthenticated) {
             this.error = 'Not authenticated';
             return;
           }

           this.loading = true;

           try {
             this.userData = await this.api.get(`/users/${this.auth.currentUser.id}`);
             this.notifications.success('Dashboard loaded');
           } catch (error) {
             this.error = 'Failed to load dashboard';
             this.notifications.error('Failed to load dashboard');
           } finally {
             this.loading = false;
           }
         }

         async updateProfile(data: any) {
           try {
             await this.api.post(`/users/${this.auth.currentUser.id}`, data);
             this.notifications.success('Profile updated');
             return true;
           } catch {
             this.notifications.error('Failed to update profile');
             return false;
           }
         }
       }

       const mockAuth = new MockAuthService();
       const mockApi = new MockApiService();
       const mockNotifications = new MockNotificationService();

       // Configure mock API responses
       mockApi.setResponse('/users/1', {
         id: '1',
         name: 'Test User',
         email: 'test@example.com'
       });

       const { component, platform } = await createFixture
         .component(UserDashboard)
         .html`<div>
           <div if.bind="loading">Loading...</div>
           <div if.bind="error">\${error}</div>
           <div if.bind="userData">\${userData.name}</div>
         </div>`
         .deps(
           Registration.instance(AuthService, mockAuth),
           Registration.instance(ApiService, mockApi),
           Registration.instance(NotificationService, mockNotifications)
         )
         .build()
         .started;

       // Wait for attached() to complete
       await tasksSettled();

       // Verify data was loaded
       expect(component.userData).toBeTruthy();
       expect(component.userData.name).toBe('Test User');
       expect(component.loading).toBe(false);
       expect(mockNotifications.notifications.length).toBe(1);
       expect(mockNotifications.notifications[0].type).toBe('success');

       // Test update
       const success = await component.updateProfile({ name: 'Updated Name' });
       expect(success).toBe(true);
       expect(mockNotifications.notifications.length).toBe(2);

       await fixture.stop(true);
     });
   });
   ```

3. Test error scenarios and recovery:
   ```typescript
   it('should handle service failures gracefully', async () => {
     class ErrorProneComponent {
       private api = resolve(ApiService);
       private notifications = resolve(NotificationService);

       data: any = null;
       error: string | null = null;

       async loadData() {
         try {
           this.error = null;
           this.data = await this.api.get('/data');
         } catch (error) {
           this.error = 'Failed to load data';
           this.notifications.error('Failed to load data');
         }
       }

       async retry() {
         await this.loadData();
       }
     }

     const mockApi = new MockApiService();
     const mockNotifications = new MockNotificationService();

     let callCount = 0;
     mockApi.get = async (endpoint: string) => {
       callCount++;
       if (callCount === 1) {
         throw new Error('Service unavailable');
       }
       return { success: true };
     };

     const { component, platform } = await createFixture
       .component(ErrorProneComponent)
       .html`<div>
         <button click.trigger="loadData()">Load</button>
         <button if.bind="error" click.trigger="retry()">Retry</button>
       </div>`
       .deps(
         Registration.instance(ApiService, mockApi),
         Registration.instance(NotificationService, mockNotifications)
       )
       .build()
       .started;

     // First load fails
     await component.loadData();
     await tasksSettled();

     expect(component.error).toBeTruthy();
     expect(component.data).toBeNull();
     expect(callCount).toBe(1);

     // Retry succeeds
     await component.retry();
     await tasksSettled();

     expect(component.error).toBeNull();
     expect(component.data).toBeTruthy();
     expect(callCount).toBe(2);

     await fixture.stop(true);
   });
   ```

### Checklist

- Multiple service dependencies are properly mocked
- Service interactions are tested in integration
- Error scenarios are tested and handled
- Retry/recovery mechanisms work correctly
- Mock services provide realistic behavior

## Testing pattern cheat sheet

| Scenario | Key Approach | Tools/APIs |
| --- | --- | --- |
| Async API calls | Mock HTTP client + `await tasksSettled()` | `MockHttpClient`, `await tasksSettled()` |
| Router navigation | Router configuration + `router.load()` | `RouterConfiguration`, `IRouter` |
| Form validation | Validation rules + controller | `IValidationRules`, `IValidationController` |
| Component interaction | Bindables + custom events | `@bindable`, `CustomEvent` |
| Lifecycle hooks | Hook execution + timing | `.started`, `stop(true)` |
| Service dependencies | Mock registrations | `Registration.instance()`, mock services |

## Best practices

1. **Always await `.started`**: Ensures all async lifecycle hooks complete
2. **Use `await tasksSettled()`**: After async operations or state changes
3. **Mock external dependencies**: HTTP clients, auth services, APIs
4. **Test error paths**: Don't just test happy scenarios
5. **Clean up with `stop(true)`**: Prevents memory leaks and interference
6. **Isolate tests**: Each test should be independent
7. **Use descriptive test names**: Clear "should..." statements
8. **Test user interactions**: Clicks, typing, form submission
9. **Verify state changes**: Check both component properties and DOM
10. **Test accessibility**: Verify ARIA attributes and keyboard navigation

## See also

- [Testing Components](./testing-components.md) - Basic component testing
- [Testing Quick Reference](./README.md) - Common testing patterns
- [Mocks and Spies](./mocks-spies.md) - Creating test doubles
- [Advanced Testing](./advanced-testing.md) - Advanced techniques
- [Fluent API](./fluent-api.md) - Fixture builder API reference
