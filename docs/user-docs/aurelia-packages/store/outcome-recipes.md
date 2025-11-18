---
description: Advanced Store patterns for async workflows, testing, form management, selectors, and type-safe state management with @aurelia/state.
---

# Store Outcome Recipes

These recipes complement the [State Outcome Recipes](../state-outcome-recipes.md) by focusing on developer ergonomics, async workflows, testing, and type safety. Use them when building production applications with `@aurelia/state`.

## 1. Async action workflows with loading states

**Goal:** Handle async operations (API calls) with proper loading, success, and error states using a consistent pattern.

### Steps

1. Define state shape with loading/error tracking:
   ```typescript
   interface User {
     id: string;
     name: string;
     email: string;
   }

   interface AppState {
     users: {
       data: User[];
       loading: boolean;
       error: string | null;
     };
     currentUser: {
       data: User | null;
       loading: boolean;
       error: string | null;
     };
   }

   const initialState: AppState = {
     users: { data: [], loading: false, error: null },
     currentUser: { data: null, loading: false, error: null }
   };
   ```

2. Create action handlers for request/success/failure pattern:
   ```typescript
   import { IHttpClient } from '@aurelia/fetch-client';
   import { resolve } from '@aurelia/kernel';

   // Request action - sets loading state
   export const fetchUsersRequest = (state: AppState) => ({
     ...state,
     users: { ...state.users, loading: true, error: null }
   });

   // Success action - stores data
   export const fetchUsersSuccess = (state: AppState, users: User[]) => ({
     ...state,
     users: { data: users, loading: false, error: null }
   });

   // Failure action - stores error
   export const fetchUsersFailure = (state: AppState, error: string) => ({
     ...state,
     users: { ...state.users, loading: false, error }
   });

   // Async thunk - orchestrates the flow
   export async function fetchUsers(state: AppState): Promise<AppState> {
     const http = resolve(IHttpClient);

     // Start loading
     let newState = fetchUsersRequest(state);

     try {
       const response = await http.fetch('/api/users');
       if (!response.ok) {
         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
       }
       const users = await response.json();

       // Success
       return fetchUsersSuccess(newState, users);
     } catch (error) {
       // Failure
       return fetchUsersFailure(newState, error.message);
     }
   }
   ```

3. Register handlers and use in components:
   ```typescript
   import Aurelia from 'aurelia';
   import { StateDefaultConfiguration } from '@aurelia/state';

   Aurelia
     .register(
       StateDefaultConfiguration.init(
         initialState,
         {},
         fetchUsersRequest,
         fetchUsersSuccess,
         fetchUsersFailure,
         fetchUsers
       )
     )
     .app(MyApp)
     .start();
   ```

   ```typescript
   import { IStore } from '@aurelia/state';
   import { resolve } from '@aurelia/kernel';
   import { fromState } from '@aurelia/state';

   export class UserList {
     private store = resolve(IStore<AppState>);

     @fromState(s => s.users.data)
     users: User[];

     @fromState(s => s.users.loading)
     loading: boolean;

     @fromState(s => s.users.error)
     error: string | null;

     async attached() {
       await this.store.dispatch(fetchUsers);
     }

     async refresh() {
       await this.store.dispatch(fetchUsers);
     }
   }
   ```

4. Display loading/error states in template:
   ```html
   <div class="user-list">
     <div if.bind="loading" class="loading">
       <span>Loading users...</span>
     </div>

     <div if.bind="error" class="error">
       <p>${error}</p>
       <button click.trigger="refresh()">Retry</button>
     </div>

     <div if.bind="!loading && !error">
       <div repeat.for="user of users" class="user-card">
         <h3>${user.name}</h3>
         <p>${user.email}</p>
       </div>

       <div if.bind="users.length === 0" class="empty">
         No users found.
       </div>
     </div>
   </div>
   ```

### Checklist

- Loading state shows during API call
- Success updates data and clears loading/error
- Failure shows error message with retry option
- Component uses `@fromState` for reactive updates
- Async action handlers return Promise
- State transitions are tracked (request → success/failure)

## 2. Form state management with validation

**Goal:** Manage complex form state including field values, validation errors, touched fields, and submission status.

### Steps

1. Define form state structure:
   ```typescript
   interface FormField<T> {
     value: T;
     error: string | null;
     touched: boolean;
   }

   interface RegistrationForm {
     email: FormField<string>;
     password: FormField<string>;
     confirmPassword: FormField<string>;
     agreedToTerms: FormField<boolean>;
   }

   interface AppState {
     registrationForm: {
       fields: RegistrationForm;
       submitting: boolean;
       submitError: string | null;
     };
   }

   const initialState: AppState = {
     registrationForm: {
       fields: {
         email: { value: '', error: null, touched: false },
         password: { value: '', error: null, touched: false },
         confirmPassword: { value: '', error: null, touched: false },
         agreedToTerms: { value: false, error: null, touched: false }
       },
       submitting: false,
       submitError: null
     }
   };
   ```

2. Create field update and validation actions:
   ```typescript
   type FieldName = keyof RegistrationForm;

   // Update field value
   export const updateField = (
     state: AppState,
     payload: { field: FieldName; value: any }
   ) => ({
     ...state,
     registrationForm: {
       ...state.registrationForm,
       fields: {
         ...state.registrationForm.fields,
         [payload.field]: {
           ...state.registrationForm.fields[payload.field],
           value: payload.value,
           touched: true
         }
       }
     }
   });

   // Validate single field
   export const validateField = (
     state: AppState,
     field: FieldName
   ): AppState => {
     const fields = state.registrationForm.fields;
     let error: string | null = null;

     switch (field) {
       case 'email':
         if (!fields.email.value) {
           error = 'Email is required';
         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
           error = 'Email is invalid';
         }
         break;

       case 'password':
         if (!fields.password.value) {
           error = 'Password is required';
         } else if (fields.password.value.length < 8) {
           error = 'Password must be at least 8 characters';
         }
         break;

       case 'confirmPassword':
         if (fields.confirmPassword.value !== fields.password.value) {
           error = 'Passwords must match';
         }
         break;

       case 'agreedToTerms':
         if (!fields.agreedToTerms.value) {
           error = 'You must agree to the terms';
         }
         break;
     }

     return {
       ...state,
       registrationForm: {
         ...state.registrationForm,
         fields: {
           ...fields,
           [field]: { ...fields[field], error }
         }
       }
     };
   };

   // Validate all fields
   export const validateAllFields = (state: AppState): AppState => {
     let newState = state;
     const fields: FieldName[] = ['email', 'password', 'confirmPassword', 'agreedToTerms'];

     for (const field of fields) {
       newState = validateField(newState, field);
     }

     return newState;
   };

   // Submit form
   export async function submitRegistration(state: AppState): Promise<AppState> {
     // Validate all fields first
     let newState = validateAllFields(state);

     // Check if any errors
     const hasErrors = Object.values(newState.registrationForm.fields)
       .some(field => field.error !== null);

     if (hasErrors) {
       return newState;
     }

     // Set submitting
     newState = {
       ...newState,
       registrationForm: {
         ...newState.registrationForm,
         submitting: true,
         submitError: null
       }
     };

     try {
       const http = resolve(IHttpClient);
       const response = await http.fetch('/api/register', {
         method: 'POST',
         body: JSON.stringify({
           email: newState.registrationForm.fields.email.value,
           password: newState.registrationForm.fields.password.value
         })
       });

       if (!response.ok) {
         throw new Error('Registration failed');
       }

       // Success - could navigate or reset form
       return {
         ...newState,
         registrationForm: {
           ...initialState.registrationForm,
           submitting: false
         }
       };
     } catch (error) {
       return {
         ...newState,
         registrationForm: {
           ...newState.registrationForm,
           submitting: false,
           submitError: error.message
         }
       };
     }
   }
   ```

3. Use in component with reactive bindings:
   ```typescript
   import { IStore } from '@aurelia/state';
   import { resolve } from '@aurelia/kernel';

   export class RegistrationForm {
     private store = resolve(IStore<AppState>);

     get email() {
       return this.store.getState().registrationForm.fields.email;
     }

     get password() {
       return this.store.getState().registrationForm.fields.password;
     }

     get confirmPassword() {
       return this.store.getState().registrationForm.fields.confirmPassword;
     }

     get agreedToTerms() {
       return this.store.getState().registrationForm.fields.agreedToTerms;
     }

     get submitting() {
       return this.store.getState().registrationForm.submitting;
     }

     get submitError() {
       return this.store.getState().registrationForm.submitError;
     }

     updateEmail(value: string) {
       this.store.dispatch(updateField, { field: 'email', value });
     }

     updatePassword(value: string) {
       this.store.dispatch(updateField, { field: 'password', value });
     }

     updateConfirmPassword(value: string) {
       this.store.dispatch(updateField, { field: 'confirmPassword', value });
     }

     updateAgreedToTerms(value: boolean) {
       this.store.dispatch(updateField, { field: 'agreedToTerms', value });
     }

     validateEmailField() {
       this.store.dispatch(validateField, 'email');
     }

     validatePasswordField() {
       this.store.dispatch(validateField, 'password');
     }

     validateConfirmPasswordField() {
       this.store.dispatch(validateField, 'confirmPassword');
     }

     async submit() {
       await this.store.dispatch(submitRegistration);
     }
   }
   ```

4. Template with validation display:
   ```html
   <form submit.trigger="submit()">
     <div class="error" if.bind="submitError">${submitError}</div>

     <div class="form-group">
       <label for="email">Email</label>
       <input
         id="email"
         type="email"
         value.bind="email.value"
         input.trigger="updateEmail($event.target.value)"
         blur.trigger="validateEmailField()"
         class="${email.error ? 'error' : ''}"
       >
       <span class="error" if.bind="email.touched && email.error">
         ${email.error}
       </span>
     </div>

     <div class="form-group">
       <label for="password">Password</label>
       <input
         id="password"
         type="password"
         value.bind="password.value"
         input.trigger="updatePassword($event.target.value)"
         blur.trigger="validatePasswordField()"
         class="${password.error ? 'error' : ''}"
       >
       <span class="error" if.bind="password.touched && password.error">
         ${password.error}
       </span>
     </div>

     <div class="form-group">
       <label for="confirmPassword">Confirm Password</label>
       <input
         id="confirmPassword"
         type="password"
         value.bind="confirmPassword.value"
         input.trigger="updateConfirmPassword($event.target.value)"
         blur.trigger="validateConfirmPasswordField()"
         class="${confirmPassword.error ? 'error' : ''}"
       >
       <span class="error" if.bind="confirmPassword.touched && confirmPassword.error">
         ${confirmPassword.error}
       </span>
     </div>

     <div class="form-group">
       <label>
         <input
           type="checkbox"
           checked.bind="agreedToTerms.value"
           change.trigger="updateAgreedToTerms($event.target.checked)"
         >
         I agree to the terms
       </label>
       <span class="error" if.bind="agreedToTerms.error">
         ${agreedToTerms.error}
       </span>
     </div>

     <button type="submit" disabled.bind="submitting">
       ${submitting ? 'Submitting...' : 'Register'}
     </button>
   </form>
   ```

### Checklist

- Field values stored in state
- Validation runs on blur
- Touched fields tracked to prevent premature errors
- Submit validates all fields
- Submission state prevents double-submit
- Form can be reset after successful submission
- Server errors displayed separately from validation errors

## 3. Memoized selectors for performance

**Goal:** Create efficient computed values from state that only recalculate when dependencies change, preventing unnecessary re-renders.

### Steps

1. Define state with complex relationships:
   ```typescript
   interface Product {
     id: string;
     name: string;
     price: number;
     categoryId: string;
     inStock: boolean;
   }

   interface Category {
     id: string;
     name: string;
   }

   interface AppState {
     products: Product[];
     categories: Category[];
     filters: {
       search: string;
       categoryId: string | null;
       showOutOfStock: boolean;
       sortBy: 'name' | 'price';
     };
   }
   ```

2. Create memoized selectors:
   ```typescript
   import { createStateMemoizer } from '@aurelia/state';

   // Simple selectors (direct state access)
   const selectProducts = (state: AppState) => state.products;
   const selectCategories = (state: AppState) => state.categories;
   const selectFilters = (state: AppState) => state.filters;

   // Memoized: Filter products by search
   const selectSearchedProducts = createStateMemoizer(
     selectProducts,
     selectFilters,
     (products, filters) => {
       if (!filters.search) return products;

       const search = filters.search.toLowerCase();
       return products.filter(p =>
         p.name.toLowerCase().includes(search)
       );
     }
   );

   // Memoized: Filter by category
   const selectCategoryFilteredProducts = createStateMemoizer(
     selectSearchedProducts,
     selectFilters,
     (products, filters) => {
       if (!filters.categoryId) return products;

       return products.filter(p => p.categoryId === filters.categoryId);
     }
   );

   // Memoized: Filter by stock availability
   const selectStockFilteredProducts = createStateMemoizer(
     selectCategoryFilteredProducts,
     selectFilters,
     (products, filters) => {
       if (filters.showOutOfStock) return products;

       return products.filter(p => p.inStock);
     }
   );

   // Memoized: Sort products
   export const selectFilteredProducts = createStateMemoizer(
     selectStockFilteredProducts,
     selectFilters,
     (products, filters) => {
       const sorted = [...products];

       if (filters.sortBy === 'name') {
         sorted.sort((a, b) => a.name.localeCompare(b.name));
       } else {
         sorted.sort((a, b) => a.price - b.price);
       }

       return sorted;
     }
   );

   // Memoized: Product stats
   export const selectProductStats = createStateMemoizer(
     selectFilteredProducts,
     (products) => ({
       total: products.length,
       inStock: products.filter(p => p.inStock).length,
       outOfStock: products.filter(p => !p.inStock).length,
       avgPrice: products.reduce((sum, p) => sum + p.price, 0) / products.length || 0
     })
   );

   // Memoized: Products by category
   export const selectProductsByCategory = createStateMemoizer(
     selectProducts,
     selectCategories,
     (products, categories) => {
       return categories.map(category => ({
         category,
         products: products.filter(p => p.categoryId === category.id)
       }));
     }
   );
   ```

3. Use selectors in components:
   ```typescript
   import { IStore } from '@aurelia/state';
   import { resolve } from '@aurelia/kernel';
   import { observable } from '@aurelia/runtime';

   export class ProductList {
     private store = resolve(IStore<AppState>);

     @observable
     filteredProducts: Product[] = [];

     @observable
     stats: ReturnType<typeof selectProductStats> = null!;

     constructor() {
       // Subscribe to state changes
       this.store.subscribe(this);
     }

     handleStateChange(state: AppState) {
       // Selectors only recompute if dependencies changed
       this.filteredProducts = selectFilteredProducts(state);
       this.stats = selectProductStats(state);
     }

     updateSearch(search: string) {
       this.store.dispatch(updateFilters, { search });
     }

     updateCategory(categoryId: string | null) {
       this.store.dispatch(updateFilters, { categoryId });
     }

     toggleShowOutOfStock() {
       const current = this.store.getState().filters.showOutOfStock;
       this.store.dispatch(updateFilters, { showOutOfStock: !current });
     }

     updateSortBy(sortBy: 'name' | 'price') {
       this.store.dispatch(updateFilters, { sortBy });
     }
   }
   ```

4. Template with filtered data:
   ```html
   <div class="product-list">
     <div class="filters">
       <input
         type="text"
         placeholder="Search..."
         value.bind="store.getState().filters.search"
         input.trigger="updateSearch($event.target.value) & debounce:300"
       >

       <select
         value.bind="store.getState().filters.categoryId"
         change.trigger="updateCategory($event.target.value || null)"
       >
         <option value="">All Categories</option>
         <option repeat.for="cat of store.getState().categories" value="${cat.id}">
           ${cat.name}
         </option>
       </select>

       <label>
         <input
           type="checkbox"
           checked.bind="store.getState().filters.showOutOfStock"
           change.trigger="toggleShowOutOfStock()"
         >
         Show out of stock
       </label>

       <select
         value.bind="store.getState().filters.sortBy"
         change.trigger="updateSortBy($event.target.value)"
       >
         <option value="name">Sort by Name</option>
         <option value="price">Sort by Price</option>
       </select>
     </div>

     <div class="stats">
       <span>Total: ${stats.total}</span>
       <span>In Stock: ${stats.inStock}</span>
       <span>Average Price: $${stats.avgPrice.toFixed(2)}</span>
     </div>

     <div class="products">
       <div repeat.for="product of filteredProducts" class="product-card">
         <h3>${product.name}</h3>
         <p class="price">$${product.price}</p>
         <span class="stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
           ${product.inStock ? 'In Stock' : 'Out of Stock'}
         </span>
       </div>
     </div>
   </div>
   ```

### Checklist

- Selectors only recompute when dependencies change
- Multiple selectors can compose (chain) together
- Component subscribes to store and updates local properties
- Template shows derived data without inline computation
- Filtering/sorting happens in selectors, not component
- Stats calculated once per state change, not per render

## 4. Testing store actions and middleware

**Goal:** Write comprehensive tests for action handlers, async operations, and middleware in isolation and integration.

### Steps

1. Set up test environment with mock store:
   ```typescript
   // test-helpers.ts
   import { StateDefaultConfiguration, IStore } from '@aurelia/state';
   import { DI } from '@aurelia/kernel';

   export function createTestStore<T>(
     initialState: T,
     ...handlers: any[]
   ): IStore<T> {
     const container = DI.createContainer();

     container.register(
       StateDefaultConfiguration.init(initialState, {}, ...handlers)
     );

     return container.get(IStore) as IStore<T>;
   }

   export function getStoreState<T>(store: IStore<T>): T {
     return store.getState();
   }
   ```

2. Test synchronous action handlers:
   ```typescript
   import { describe, it, expect } from '@jest/globals';
   import { createTestStore } from './test-helpers';

   describe('Counter actions', () => {
     interface CounterState {
       count: number;
     }

     const increment = (state: CounterState) => ({
       ...state,
       count: state.count + 1
     });

     const decrement = (state: CounterState) => ({
       ...state,
       count: state.count - 1
     });

     const incrementBy = (state: CounterState, amount: number) => ({
       ...state,
       count: state.count + amount
     });

     it('should increment count', () => {
       const store = createTestStore({ count: 0 }, increment);

       store.dispatch(increment);

       expect(store.getState().count).toBe(1);
     });

     it('should decrement count', () => {
       const store = createTestStore({ count: 5 }, decrement);

       store.dispatch(decrement);

       expect(store.getState().count).toBe(4);
     });

     it('should increment by amount', () => {
       const store = createTestStore({ count: 0 }, incrementBy);

       store.dispatch(incrementBy, 5);

       expect(store.getState().count).toBe(5);
     });

     it('should handle multiple dispatches', () => {
       const store = createTestStore({ count: 0 }, increment, decrement);

       store.dispatch(increment);
       store.dispatch(increment);
       store.dispatch(decrement);

       expect(store.getState().count).toBe(1);
     });
   });
   ```

3. Test async action handlers:
   ```typescript
   import { describe, it, expect, jest, beforeEach } from '@jest/globals';
   import { IHttpClient } from '@aurelia/fetch-client';
   import { Registration } from '@aurelia/kernel';
   import { createTestStore } from './test-helpers';

   describe('Async user actions', () => {
     interface User {
       id: string;
       name: string;
     }

     interface UserState {
       users: User[];
       loading: boolean;
       error: string | null;
     }

     // Action handlers
     const fetchUsersRequest = (state: UserState) => ({
       ...state,
       loading: true,
       error: null
     });

     const fetchUsersSuccess = (state: UserState, users: User[]) => ({
       ...state,
       users,
       loading: false
     });

     const fetchUsersFailure = (state: UserState, error: string) => ({
       ...state,
       loading: false,
       error
     });

     async function fetchUsers(state: UserState): Promise<UserState> {
       const http = resolve(IHttpClient);
       let newState = fetchUsersRequest(state);

       try {
         const response = await http.fetch('/api/users');
         const users = await response.json();
         return fetchUsersSuccess(newState, users);
       } catch (error) {
         return fetchUsersFailure(newState, error.message);
       }
     }

     // Mock HTTP client
     class MockHttpClient {
       mockResponse: any = null;
       mockError: Error | null = null;

       async fetch(url: string): Promise<Response> {
         if (this.mockError) {
           throw this.mockError;
         }

         return {
           ok: true,
           json: async () => this.mockResponse
         } as Response;
       }
     }

     let mockHttp: MockHttpClient;

     beforeEach(() => {
       mockHttp = new MockHttpClient();
     });

     it('should fetch users successfully', async () => {
       const users = [
         { id: '1', name: 'Alice' },
         { id: '2', name: 'Bob' }
       ];
       mockHttp.mockResponse = users;

       const container = DI.createContainer();
       container.register(Registration.instance(IHttpClient, mockHttp));
       container.register(
         StateDefaultConfiguration.init(
           { users: [], loading: false, error: null },
           {},
           fetchUsersRequest,
           fetchUsersSuccess,
           fetchUsersFailure,
           fetchUsers
         )
       );

       const store = container.get(IStore) as IStore<UserState>;

       // Dispatch and wait
       await store.dispatch(fetchUsers);

       const state = store.getState();
       expect(state.loading).toBe(false);
       expect(state.users).toEqual(users);
       expect(state.error).toBeNull();
     });

     it('should handle fetch errors', async () => {
       mockHttp.mockError = new Error('Network error');

       const container = DI.createContainer();
       container.register(Registration.instance(IHttpClient, mockHttp));
       container.register(
         StateDefaultConfiguration.init(
           { users: [], loading: false, error: null },
           {},
           fetchUsersRequest,
           fetchUsersSuccess,
           fetchUsersFailure,
           fetchUsers
         )
       );

       const store = container.get(IStore) as IStore<UserState>;

       await store.dispatch(fetchUsers);

       const state = store.getState();
       expect(state.loading).toBe(false);
       expect(state.users).toEqual([]);
       expect(state.error).toBe('Network error');
     });
   });
   ```

4. Test middleware:
   ```typescript
   import { describe, it, expect, jest } from '@jest/globals';
   import { IStateMiddleware, MiddlewarePlacement } from '@aurelia/state';

   describe('Middleware', () => {
     interface TestState {
       count: number;
       history: number[];
     }

     const increment = (state: TestState) => ({
       ...state,
       count: state.count + 1
     });

     it('should execute before middleware', () => {
       const calls: string[] = [];

       const beforeMiddleware: IStateMiddleware<TestState> = (state, action) => {
         calls.push('before');
         return state;
       };

       const container = DI.createContainer();
       container.register(
         StateDefaultConfiguration.init(
           { count: 0, history: [] },
           {
             middlewares: [
               { middleware: beforeMiddleware, placement: MiddlewarePlacement.Before }
             ]
           },
           increment
         )
       );

       const store = container.get(IStore) as IStore<TestState>;

       store.dispatch(increment);

       expect(calls).toEqual(['before']);
       expect(store.getState().count).toBe(1);
     });

     it('should execute after middleware', () => {
       const afterMiddleware: IStateMiddleware<TestState> = (state, action) => {
         return {
           ...state,
           history: [...state.history, state.count]
         };
       };

       const container = DI.createContainer();
       container.register(
         StateDefaultConfiguration.init(
           { count: 0, history: [] },
           {
             middlewares: [
               { middleware: afterMiddleware, placement: MiddlewarePlacement.After }
             ]
           },
           increment
         )
       );

       const store = container.get(IStore) as IStore<TestState>;

       store.dispatch(increment);
       store.dispatch(increment);

       const state = store.getState();
       expect(state.count).toBe(2);
       expect(state.history).toEqual([1, 2]);
     });

     it('should block action with false return', () => {
       const blockingMiddleware: IStateMiddleware<TestState> = (state, action) => {
         if (state.count >= 5) {
           return false; // Block
         }
         return state;
       };

       const container = DI.createContainer();
       container.register(
         StateDefaultConfiguration.init(
           { count: 5, history: [] },
           {
             middlewares: [
               { middleware: blockingMiddleware, placement: MiddlewarePlacement.Before }
             ]
           },
           increment
         )
       );

       const store = container.get(IStore) as IStore<TestState>;

       store.dispatch(increment);

       // Should not increment because middleware blocked it
       expect(store.getState().count).toBe(5);
     });
   });
   ```

5. Test component integration with store:
   ```typescript
   import { describe, it, expect } from '@jest/globals';
   import { createFixture } from '@aurelia/testing';
   import { StateDefaultConfiguration, IStore } from '@aurelia/state';
   import { Registration } from '@aurelia/kernel';

   describe('Component with Store', () => {
     interface CounterState {
       count: number;
     }

     const increment = (state: CounterState) => ({
       ...state,
       count: state.count + 1
     });

     it('should update when store changes', async () => {
       class CounterComponent {
         private store = resolve(IStore<CounterState>);

         get count() {
           return this.store.getState().count;
         }

         increment() {
           this.store.dispatch(increment);
         }
       }

       const initialState = { count: 0 };
       const container = DI.createContainer();
       container.register(
         StateDefaultConfiguration.init(initialState, {}, increment)
       );

       const { component, trigger, assertText, platform } = await createFixture
         .component(CounterComponent)
         .html`
           <div>
             <span id="count">\${count}</span>
             <button click.trigger="increment()">Increment</button>
           </div>
         `
         .deps(Registration.instance(DI.Container, container))
         .build()
         .started;

       // Initial state
       assertText('#count', '0');

       // Click button
       trigger.click('button');
       await platform.taskQueue.yield();

       // Verify state updated
       assertText('#count', '1');

       await fixture.stop(true);
     });
   });
   ```

### Checklist

- Action handlers tested in isolation
- Async actions tested with mock HTTP client
- Middleware execution order verified
- Middleware can transform or block actions
- Component integration with store is testable
- Test helpers simplify store creation
- All state transitions are predictable and tested

## 5. Type-safe actions with discriminated unions

**Goal:** Create fully type-safe store actions using TypeScript discriminated unions to prevent typos and improve IDE autocomplete.

### Steps

1. Define action types as discriminated union:
   ```typescript
   // Action type definitions
   interface IncrementAction {
     type: 'INCREMENT';
   }

   interface DecrementAction {
     type: 'DECREMENT';
   }

   interface IncrementByAction {
     type: 'INCREMENT_BY';
     payload: number;
   }

   interface SetCountAction {
     type: 'SET_COUNT';
     payload: number;
   }

   interface ResetAction {
     type: 'RESET';
   }

   // Union of all action types
   type CounterAction =
     | IncrementAction
     | DecrementAction
     | IncrementByAction
     | SetCountAction
     | ResetAction;

   // Action creators with type safety
   export const CounterActions = {
     increment: (): IncrementAction => ({ type: 'INCREMENT' }),
     decrement: (): DecrementAction => ({ type: 'DECREMENT' }),
     incrementBy: (amount: number): IncrementByAction => ({
       type: 'INCREMENT_BY',
       payload: amount
     }),
     setCount: (count: number): SetCountAction => ({
       type: 'SET_COUNT',
       payload: count
     }),
     reset: (): ResetAction => ({ type: 'RESET' })
   };
   ```

2. Create type-safe reducer with exhaustiveness checking:
   ```typescript
   interface CounterState {
     count: number;
     history: number[];
   }

   const initialState: CounterState = {
     count: 0,
     history: []
   };

   // Single reducer handling all actions
   export const counterReducer = (
     state: CounterState,
     action: CounterAction
   ): CounterState => {
     switch (action.type) {
       case 'INCREMENT':
         return {
           ...state,
           count: state.count + 1,
           history: [...state.history, state.count + 1]
         };

       case 'DECREMENT':
         return {
           ...state,
           count: state.count - 1,
           history: [...state.history, state.count - 1]
         };

       case 'INCREMENT_BY':
         return {
           ...state,
           count: state.count + action.payload,
           history: [...state.history, state.count + action.payload]
         };

       case 'SET_COUNT':
         return {
           ...state,
           count: action.payload,
           history: [...state.history, action.payload]
         };

       case 'RESET':
         return initialState;

       default:
         // Exhaustiveness check - TypeScript will error if we miss a case
         const _exhaustive: never = action;
         return state;
     }
   };
   ```

3. Register with store and use in components:
   ```typescript
   import Aurelia from 'aurelia';
   import { StateDefaultConfiguration } from '@aurelia/state';

   Aurelia
     .register(
       StateDefaultConfiguration.init(initialState, {}, counterReducer)
     )
     .app(MyApp)
     .start();
   ```

   ```typescript
   import { IStore } from '@aurelia/state';
   import { resolve } from '@aurelia/kernel';
   import { CounterActions } from './counter-actions';

   export class Counter {
     private store = resolve(IStore<CounterState>);

     get count() {
       return this.store.getState().count;
     }

     get history() {
       return this.store.getState().history;
     }

     // Type-safe action dispatching
     increment() {
       this.store.dispatch(counterReducer, CounterActions.increment());
     }

     decrement() {
       this.store.dispatch(counterReducer, CounterActions.decrement());
     }

     incrementBy(amount: number) {
       this.store.dispatch(counterReducer, CounterActions.incrementBy(amount));
     }

     setCount(count: number) {
       this.store.dispatch(counterReducer, CounterActions.setCount(count));
     }

     reset() {
       this.store.dispatch(counterReducer, CounterActions.reset());
     }
   }
   ```

4. Template with type-safe actions:
   ```html
   <div class="counter">
     <h2>Count: ${count}</h2>

     <div class="buttons">
       <button click.trigger="decrement()">-</button>
       <button click.trigger="increment()">+</button>
       <button click.trigger="incrementBy(5)">+5</button>
       <button click.trigger="reset()">Reset</button>
     </div>

     <div class="history">
       <h3>History</h3>
       <ul>
         <li repeat.for="value of history">${value}</li>
       </ul>
     </div>
   </div>
   ```

### Checklist

- Action types are discriminated unions
- Action creators provide type safety
- Reducer uses switch with exhaustiveness check
- TypeScript catches missing action types
- IDE provides autocomplete for action types
- Payload types are enforced
- No string literals in component code

## 6. Batch updates to prevent intermediate renders

**Goal:** Dispatch multiple actions as a single transaction to avoid intermediate state emissions and unnecessary re-renders.

### Steps

1. Create batch action wrapper:
   ```typescript
   interface BatchAction<T> {
     type: 'BATCH';
     actions: Array<(state: T) => T>;
   }

   export function createBatchAction<T>(
     ...actions: Array<(state: T) => T>
   ): BatchAction<T> {
     return {
       type: 'BATCH',
       actions
     };
   }

   export function batchReducer<T>(state: T, action: BatchAction<T>): T {
     if (action.type !== 'BATCH') {
       return state;
     }

     // Apply all actions sequentially
     return action.actions.reduce((currentState, actionFn) => {
       return actionFn(currentState);
     }, state);
   }
   ```

2. Use batch actions in complex operations:
   ```typescript
   interface TodoState {
     todos: Todo[];
     filter: 'all' | 'active' | 'completed';
     selectedIds: string[];
   }

   const addTodo = (state: TodoState, todo: Todo) => ({
     ...state,
     todos: [...state.todos, todo]
   });

   const setFilter = (state: TodoState, filter: TodoState['filter']) => ({
     ...state,
     filter
   });

   const selectTodo = (state: TodoState, id: string) => ({
     ...state,
     selectedIds: [...state.selectedIds, id]
   });

   // Component
   export class TodoList {
     private store = resolve(IStore<TodoState>);

     // Without batching - 3 separate renders
     addTodoSlowly(title: string) {
       const newTodo: Todo = {
         id: crypto.randomUUID(),
         title,
         completed: false
       };

       this.store.dispatch(addTodo, newTodo);
       this.store.dispatch(selectTodo, newTodo.id);
       this.store.dispatch(setFilter, 'all');
       // Component re-renders 3 times!
     }

     // With batching - 1 render
     addTodoFast(title: string) {
       const newTodo: Todo = {
         id: crypto.randomUUID(),
         title,
         completed: false
       };

       const batchAction = createBatchAction<TodoState>(
         state => addTodo(state, newTodo),
         state => selectTodo(state, newTodo.id),
         state => setFilter(state, 'all')
       );

       this.store.dispatch(batchReducer, batchAction);
       // Component re-renders only once!
     }
   }
   ```

3. Create batch middleware for automatic batching:
   ```typescript
   import { IStateMiddleware, MiddlewarePlacement } from '@aurelia/state';

   interface QueuedAction<T> {
     handler: (state: T, action: any) => T;
     action: any;
   }

   export function createBatchMiddleware<T>(
     flushDelayMs: number = 0
   ): IStateMiddleware<T> {
     let queue: QueuedAction<T>[] = [];
     let timeoutId: number | null = null;
     let currentStore: any = null;

     const flush = () => {
       if (queue.length === 0) return;

       const actionsToProcess = [...queue];
       queue = [];

       // Process all queued actions in one batch
       const batchedState = actionsToProcess.reduce((state, { handler, action }) => {
         return handler(state, action);
       }, currentStore.getState());

       // Update state once
       currentStore['_state'] = batchedState;
       currentStore['_notify']();

       timeoutId = null;
     };

     return (state, action, settings) => {
       // Skip if this is already a batch operation
       if (action?.type === 'BATCH') {
         return state;
       }

       // Queue the action
       queue.push({ handler: settings?.handler || ((s) => s), action });

       // Set up flush
       if (timeoutId !== null) {
         clearTimeout(timeoutId);
       }

       if (flushDelayMs === 0) {
         // Immediate batching (next microtask)
         Promise.resolve().then(flush);
       } else {
         // Delayed batching
         timeoutId = window.setTimeout(flush, flushDelayMs);
       }

       // Return false to prevent immediate processing
       return false;
     };
   }
   ```

### Checklist

- Batch action combines multiple updates
- Only one state emission for batched actions
- Components re-render once instead of N times
- Batch middleware can auto-batch within time window
- Complex operations remain atomic
- State consistency maintained throughout batch

## Store pattern cheat sheet

| Pattern | Key API | Use When |
| --- | --- | --- |
| Async workflows | Async action handlers + loading state | Making API calls, handling loading/error states |
| Form management | Nested state with validation | Complex forms with validation logic |
| Memoized selectors | `createStateMemoizer` | Deriving computed values, optimizing performance |
| Testing | Test helpers + mocks | Writing unit/integration tests for store |
| Type-safe actions | Discriminated unions | Preventing typos, getting IDE autocomplete |
| Batch updates | Batch reducer or middleware | Preventing intermediate renders, atomic updates |

## Best practices

1. **Normalize state structure**: Flat objects with IDs, not nested arrays
2. **Use selectors for derived data**: Don't compute in components or templates
3. **Keep actions pure**: No side effects in reducers
4. **Handle async in actions, not middleware**: Middleware for cross-cutting concerns
5. **Test action handlers separately**: Unit test pure functions first
6. **Type everything**: Use TypeScript for state shape and actions
7. **Memoize expensive computations**: Use `createStateMemoizer` for derived state
8. **Batch related updates**: Use batch actions for complex operations
9. **Structure by feature**: Group related actions/state together
10. **Subscribe in constructors, unsubscribe in dispose**: Prevent memory leaks

## See also

- [State plugin guide](../state.md) - Complete state API reference
- [State outcome recipes](../state-outcome-recipes.md) - Persistence & sync patterns
- [Store configuration](./configuration-and-setup.md) - Plugin setup
- [Store middleware](./middleware.md) - Middleware deep dive
- [Testing outcome recipes](../../developer-guides/testing/outcome-recipes.md) - Component testing patterns
