---
description: Comprehensive error handling patterns for building resilient Aurelia applications with graceful degradation and user-friendly feedback.
---

# Error Handling Patterns

These patterns show you how to handle errors gracefully across different layers of your Aurelia application - from API calls and routing to form validation and global error boundaries.

## 1. Global error boundary with user feedback

**Goal:** Catch unhandled errors anywhere in your app, log them for debugging, and show users a friendly message instead of a blank screen.

### Steps

1. Create an error boundary service that tracks errors and provides recovery options:
   ```typescript
   import { ILogger, resolve } from '@aurelia/kernel';
   import { observable } from '@aurelia/runtime';

   export interface AppError {
     message: string;
     stack?: string;
     timestamp: number;
     context?: string;
   }

   export class ErrorBoundaryService {
     @observable currentError: AppError | null = null;
     private errors: AppError[] = [];
     private logger = resolve(ILogger);

     captureError(error: Error, context?: string) {
       const appError: AppError = {
         message: error.message,
         stack: error.stack,
         timestamp: Date.now(),
         context
       };

       this.errors.push(appError);
       this.currentError = appError;

       this.logger.error(`[${context || 'Unknown'}] ${error.message}`, error);

       return appError;
     }

     clearError() {
       this.currentError = null;
     }

     getRecentErrors(count: number = 10) {
       return this.errors.slice(-count);
     }
   }
   ```

2. Register a global error handler during app startup:
   ```typescript
   import { Aurelia } from 'aurelia';
   import { ErrorBoundaryService } from './error-boundary-service';

   export async function main() {
     const au = Aurelia.app(MyApp);
     const errorBoundary = au.container.get(ErrorBoundaryService);

     window.addEventListener('error', (event) => {
       errorBoundary.captureError(event.error, 'Window');
       event.preventDefault();
     });

     window.addEventListener('unhandledrejection', (event) => {
       errorBoundary.captureError(
         new Error(event.reason?.message || 'Unhandled promise rejection'),
         'Promise'
       );
       event.preventDefault();
     });

     await au.start();
   }
   ```

3. Display errors in your root component with recovery actions:
   ```typescript
   import { resolve } from '@aurelia/kernel';
   import { ErrorBoundaryService } from './error-boundary-service';

   export class MyApp {
     private errorBoundary = resolve(ErrorBoundaryService);

     reload() {
       window.location.reload();
     }

     dismissError() {
       this.errorBoundary.clearError();
     }
   }
   ```

   ```html
   <div class="error-banner" if.bind="errorBoundary.currentError">
     <div class="error-content">
       <h3>Something went wrong</h3>
       <p>${errorBoundary.currentError.message}</p>
       <div class="error-actions">
         <button click.trigger="dismissError()">Dismiss</button>
         <button click.trigger="reload()">Reload Page</button>
       </div>
     </div>
   </div>

   <au-viewport></au-viewport>
   ```

### Checklist

- Unhandled errors display in the banner instead of crashing the app
- Console logs include full error details for debugging
- Users can dismiss transient errors or reload for critical failures
- Error history is available for support tickets

## 2. API error handling with retry and fallback

**Goal:** Handle API failures gracefully with automatic retries, fallback data, and clear user feedback about network issues.

### Steps

1. Create an API service wrapper with error handling:
   ```typescript
   import { IHttpClient } from '@aurelia/fetch-client';
   import { resolve } from '@aurelia/kernel';
   import { ErrorBoundaryService } from './error-boundary-service';

   export interface ApiOptions {
     retries?: number;
     fallbackData?: any;
     showErrorToUser?: boolean;
   }

   export class ApiService {
     private http = resolve(IHttpClient);
     private errorBoundary = resolve(ErrorBoundaryService);

     async fetchWithErrorHandling<T>(
       url: string,
       options: ApiOptions = {}
     ): Promise<T | null> {
       const { retries = 2, fallbackData = null, showErrorToUser = true } = options;
       let lastError: Error;

       for (let attempt = 0; attempt <= retries; attempt++) {
         try {
           const response = await this.http.fetch(url);

           if (!response.ok) {
             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
           }

           return await response.json();
         } catch (error) {
           lastError = error as Error;

           // Wait before retrying (exponential backoff)
           if (attempt < retries) {
             await this.delay(Math.pow(2, attempt) * 1000);
           }
         }
       }

       // All retries failed
       if (showErrorToUser) {
         this.errorBoundary.captureError(
           lastError!,
           `API call failed: ${url}`
         );
       }

       return fallbackData;
     }

     private delay(ms: number): Promise<void> {
       return new Promise(resolve => setTimeout(resolve, ms));
     }
   }
   ```

2. Use the service in components with loading and error states:
   ```typescript
   import { resolve } from '@aurelia/kernel';
   import { ApiService } from './api-service';

   interface Product {
     id: string;
     name: string;
     price: number;
   }

   export class ProductList {
     private api = resolve(ApiService);

     products: Product[] = [];
     loading = false;
     error: string | null = null;

     async attached() {
       await this.loadProducts();
     }

     async loadProducts() {
       this.loading = true;
       this.error = null;

       try {
         const data = await this.api.fetchWithErrorHandling<Product[]>(
           '/api/products',
           {
             retries: 3,
             fallbackData: [],
             showErrorToUser: false
           }
         );

         this.products = data || [];

         if (!data) {
           this.error = 'Unable to load products. Please try again later.';
         }
       } catch (error) {
         this.error = 'An unexpected error occurred.';
       } finally {
         this.loading = false;
       }
     }
   }
   ```

3. Display appropriate UI for each state:
   ```html
   <div class="product-list">
     <div if.bind="loading" class="loading">
       <span>Loading products...</span>
     </div>

     <div if.bind="error" class="error-message">
       <p>${error}</p>
       <button click.trigger="loadProducts()">Try Again</button>
     </div>

     <div if.bind="!loading && !error">
       <div repeat.for="product of products" class="product">
         <h3>${product.name}</h3>
         <span class="price">$${product.price}</span>
       </div>

       <div if.bind="products.length === 0" class="empty">
         No products available.
       </div>
     </div>
   </div>
   ```

### Checklist

- Failed API calls retry automatically with exponential backoff
- Components show loading state during fetch operations
- Users see clear error messages when data fails to load
- Fallback data prevents empty states from crashing the UI
- Users can manually retry failed operations

## 3. Router navigation error handling

**Goal:** Handle route navigation failures, missing routes, and guard rejections with appropriate redirects and user feedback.

### Steps

1. Create a navigation error handler:
   ```typescript
   import { IRouter, IRouteableComponent, NavigationInstruction } from '@aurelia/router';
   import { resolve } from '@aurelia/kernel';
   import { ErrorBoundaryService } from './error-boundary-service';

   export class NavigationGuard implements IRouteableComponent {
     private router = resolve(IRouter);
     private errorBoundary = resolve(ErrorBoundaryService);

     canLoad(params: any, next: NavigationInstruction, current: NavigationInstruction) {
       try {
         // Validate navigation requirements
         if (next.data?.requiresAuth && !this.isAuthenticated()) {
           this.router.load('/login', { replace: true });
           return false;
         }

         return true;
       } catch (error) {
         this.errorBoundary.captureError(
           error as Error,
           'Navigation guard'
         );
         this.router.load('/error');
         return false;
       }
     }

     async loading(params: any, next: NavigationInstruction, current: NavigationInstruction) {
       try {
         // Load required data
         if (next.data?.preload) {
           await this.preloadData(next.data.preload);
         }
       } catch (error) {
         this.errorBoundary.captureError(
           error as Error,
           `Data loading failed for route: ${next.path}`
         );

         // Redirect to error page with return URL
         this.router.load(`/error?returnUrl=${encodeURIComponent(next.path)}`);
         throw error;
       }
     }

     private isAuthenticated(): boolean {
       // Check authentication status
       return localStorage.getItem('token') !== null;
     }

     private async preloadData(keys: string[]) {
       // Preload data logic
     }
   }
   ```

2. Configure router with error handling:
   ```typescript
   import { IRouter, RouterConfiguration } from '@aurelia/router';
   import { ErrorBoundaryService } from './error-boundary-service';

   export class MyApp {
     static routes = [
       {
         path: '',
         component: () => import('./pages/home'),
         title: 'Home'
       },
       {
         path: 'dashboard',
         component: () => import('./pages/dashboard'),
         title: 'Dashboard',
         data: { requiresAuth: true }
       },
       {
         path: 'error',
         component: () => import('./pages/error'),
         title: 'Error'
       },
       {
         path: '**',
         component: () => import('./pages/not-found'),
         title: 'Not Found'
       }
     ];

     private router = resolve(IRouter);
     private errorBoundary = resolve(ErrorBoundaryService);

     binding() {
       // Handle navigation errors globally
       this.router.events.subscribe('au:router:navigation-error', (event) => {
         this.errorBoundary.captureError(
           new Error(`Navigation failed: ${event.error.message}`),
           'Router'
         );
         this.router.load('/error', { replace: true });
       });
     }
   }
   ```

3. Create an error page with helpful actions:
   ```typescript
   import { IRouter } from '@aurelia/router';
   import { resolve } from '@aurelia/kernel';

   export class ErrorPage {
     private router = resolve(IRouter);
     returnUrl: string = '/';

     loading(params: any) {
       this.returnUrl = params.returnUrl || '/';
     }

     retry() {
       this.router.load(this.returnUrl);
     }

     goHome() {
       this.router.load('/');
     }
   }
   ```

   ```html
   <div class="error-page">
     <h1>Unable to Load Page</h1>
     <p>We encountered an error while loading the requested page.</p>

     <div class="actions">
       <button click.trigger="retry()">Try Again</button>
       <button click.trigger="goHome()">Go to Home</button>
     </div>
   </div>
   ```

### Checklist

- Failed navigation redirects to error page instead of blank screen
- Authentication failures redirect to login with return URL
- Users can retry failed navigation or return home
- 404 routes show custom not-found page
- Navigation errors are logged for debugging

## 4. Form validation errors with field-level feedback

**Goal:** Display validation errors inline next to form fields while preventing submission of invalid data.

### Steps

1. Create a form with validation rules and error display:
   ```typescript
   import { IValidationRules } from '@aurelia/validation';
   import { IValidationController } from '@aurelia/validation-html';
   import { newInstanceForScope, resolve } from '@aurelia/kernel';

   export class UserRegistrationForm {
     user = {
       email: '',
       password: '',
       confirmPassword: '',
       age: null
     };

     controller = resolve(newInstanceForScope(IValidationController));
     submitting = false;
     submitError: string | null = null;

     constructor(private rules = resolve(IValidationRules)) {
       this.rules
         .on(this.user)
         .ensure('email')
           .required().withMessage('Email is required')
           .email().withMessage('Please enter a valid email')
         .ensure('password')
           .required().withMessage('Password is required')
           .minLength(8).withMessage('Password must be at least 8 characters')
           .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
           .matches(/[0-9]/).withMessage('Password must contain a number')
         .ensure('confirmPassword')
           .required().withMessage('Please confirm your password')
           .satisfies((value, obj) => value === obj.password)
             .withMessage('Passwords must match')
         .ensure('age')
           .required().withMessage('Age is required')
           .satisfies((value) => value >= 18)
             .withMessage('You must be 18 or older to register');
     }

     async submit() {
       this.submitError = null;

       const result = await this.controller.validate();
       if (!result.valid) {
         return;
       }

       this.submitting = true;

       try {
         const response = await fetch('/api/register', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(this.user)
         });

         if (!response.ok) {
           const data = await response.json();

           // Handle server-side validation errors
           if (data.errors) {
             data.errors.forEach((err: { property: string; message: string }) => {
               this.controller.addError(err.message, this.user, err.property);
             });
             return;
           }

           throw new Error(data.message || 'Registration failed');
         }

         // Success - redirect to dashboard
         window.location.href = '/dashboard';
       } catch (error) {
         this.submitError = error.message || 'An unexpected error occurred. Please try again.';
       } finally {
         this.submitting = false;
       }
     }
   }
   ```

2. Display validation errors inline with accessible markup:
   ```html
   <form submit.trigger="submit()">
     <div class="form-error" if.bind="submitError">
       <p>${submitError}</p>
     </div>

     <div class="form-group" validation-errors.from-view="emailErrors">
       <label for="email">Email</label>
       <input
         id="email"
         type="email"
         value.bind="user.email & validate:changeOrBlur"
         class="${emailErrors.length ? 'error' : ''}"
         aria-invalid="${emailErrors.length ? 'true' : 'false'}"
         aria-describedby="${emailErrors.length ? 'email-errors' : ''}"
       >
       <ul id="email-errors" class="errors" if.bind="emailErrors.length">
         <li repeat.for="error of emailErrors">${error.result.message}</li>
       </ul>
     </div>

     <div class="form-group" validation-errors.from-view="passwordErrors">
       <label for="password">Password</label>
       <input
         id="password"
         type="password"
         value.bind="user.password & validate:changeOrBlur"
         class="${passwordErrors.length ? 'error' : ''}"
       >
       <ul class="errors" if.bind="passwordErrors.length">
         <li repeat.for="error of passwordErrors">${error.result.message}</li>
       </ul>
     </div>

     <div class="form-group" validation-errors.from-view="confirmPasswordErrors">
       <label for="confirmPassword">Confirm Password</label>
       <input
         id="confirmPassword"
         type="password"
         value.bind="user.confirmPassword & validate:changeOrBlur"
         class="${confirmPasswordErrors.length ? 'error' : ''}"
       >
       <ul class="errors" if.bind="confirmPasswordErrors.length">
         <li repeat.for="error of confirmPasswordErrors">${error.result.message}</li>
       </ul>
     </div>

     <div class="form-group" validation-errors.from-view="ageErrors">
       <label for="age">Age</label>
       <input
         id="age"
         type="number"
         value.bind="user.age & validate:changeOrBlur"
         class="${ageErrors.length ? 'error' : ''}"
       >
       <ul class="errors" if.bind="ageErrors.length">
         <li repeat.for="error of ageErrors">${error.result.message}</li>
       </ul>
     </div>

     <button type="submit" disabled.bind="submitting">
       ${submitting ? 'Submitting...' : 'Register'}
     </button>
   </form>
   ```

### Checklist

- Validation errors appear inline next to each field
- Users see errors on blur and as they type to fix them
- Form submission is prevented when validation fails
- Server-side errors merge with client-side validation
- Submit button is disabled during submission
- Error messages are accessible with ARIA attributes

## 5. Async operation error boundaries with timeout

**Goal:** Wrap async operations with timeouts and error handling to prevent indefinite loading states.

### Steps

1. Create a timeout utility with error handling:
   ```typescript
   export class TimeoutError extends Error {
     constructor(operation: string, timeoutMs: number) {
       super(`Operation '${operation}' timed out after ${timeoutMs}ms`);
       this.name = 'TimeoutError';
     }
   }

   export async function withTimeout<T>(
     operation: Promise<T>,
     timeoutMs: number,
     operationName: string
   ): Promise<T> {
     return Promise.race([
       operation,
       new Promise<T>((_, reject) =>
         setTimeout(
           () => reject(new TimeoutError(operationName, timeoutMs)),
           timeoutMs
         )
       )
     ]);
   }
   ```

2. Use the timeout wrapper in components:
   ```typescript
   import { resolve } from '@aurelia/kernel';
   import { IHttpClient } from '@aurelia/fetch-client';
   import { withTimeout, TimeoutError } from './timeout-util';
   import { ErrorBoundaryService } from './error-boundary-service';

   export class Dashboard {
     private http = resolve(IHttpClient);
     private errorBoundary = resolve(ErrorBoundaryService);

     data: any = null;
     loading = false;
     error: string | null = null;

     async attached() {
       await this.loadDashboard();
     }

     async loadDashboard() {
       this.loading = true;
       this.error = null;

       try {
         const response = await withTimeout(
           this.http.fetch('/api/dashboard'),
           8000,
           'Dashboard load'
         );

         this.data = await response.json();
       } catch (error) {
         if (error instanceof TimeoutError) {
           this.error = 'Loading is taking longer than expected. Please check your connection and try again.';
         } else {
           this.error = 'Unable to load dashboard. Please try again later.';
         }

         this.errorBoundary.captureError(error as Error, 'Dashboard');
       } finally {
         this.loading = false;
       }
     }
   }
   ```

### Checklist

- Long-running operations timeout with clear error messages
- Timeout errors are distinguishable from other failures
- Users aren't stuck in infinite loading states
- Errors are logged for monitoring

## 6. Optimistic updates with rollback on error

**Goal:** Update UI immediately for better UX, but revert changes if the server rejects the update.

### Steps

1. Implement optimistic updates with error recovery:
   ```typescript
   import { resolve } from '@aurelia/kernel';
   import { IHttpClient } from '@aurelia/fetch-client';
   import { ErrorBoundaryService } from './error-boundary-service';

   interface Todo {
     id: string;
     title: string;
     completed: boolean;
   }

   export class TodoList {
     private http = resolve(IHttpClient);
     private errorBoundary = resolve(ErrorBoundaryService);

     todos: Todo[] = [];
     error: string | null = null;

     async toggleTodo(todo: Todo) {
       // Save original state
       const originalCompleted = todo.completed;

       // Optimistic update
       todo.completed = !todo.completed;

       try {
         const response = await this.http.fetch(`/api/todos/${todo.id}`, {
           method: 'PATCH',
           body: JSON.stringify({ completed: todo.completed })
         });

         if (!response.ok) {
           throw new Error('Failed to update todo');
         }
       } catch (error) {
         // Rollback on error
         todo.completed = originalCompleted;

         this.error = 'Unable to update todo. Please try again.';
         this.errorBoundary.captureError(error as Error, 'Todo update');

         // Clear error after 3 seconds
         setTimeout(() => {
           this.error = null;
         }, 3000);
       }
     }

     async deleteTodo(todo: Todo) {
       // Save original list state
       const originalTodos = [...this.todos];
       const index = this.todos.indexOf(todo);

       // Optimistic removal
       this.todos.splice(index, 1);

       try {
         const response = await this.http.fetch(`/api/todos/${todo.id}`, {
           method: 'DELETE'
         });

         if (!response.ok) {
           throw new Error('Failed to delete todo');
         }
       } catch (error) {
         // Restore original list on error
         this.todos = originalTodos;

         this.error = 'Unable to delete todo. Please try again.';
         this.errorBoundary.captureError(error as Error, 'Todo delete');
       }
     }
   }
   ```

2. Provide visual feedback during updates:
   ```html
   <div class="todo-list">
     <div class="error-toast" if.bind="error">
       ${error}
     </div>

     <div repeat.for="todo of todos" class="todo-item">
       <input
         type="checkbox"
         checked.bind="todo.completed"
         change.trigger="toggleTodo(todo)"
       >
       <span class="${todo.completed ? 'completed' : ''}">${todo.title}</span>
       <button click.trigger="deleteTodo(todo)">Delete</button>
     </div>
   </div>
   ```

### Checklist

- UI updates immediately when users interact
- Failed updates revert to previous state
- Users see error notifications for failed operations
- Original state is preserved for rollback

## Error handling cheat sheet

| Scenario | Pattern | Key Components |
| --- | --- | --- |
| Global unhandled errors | Error boundary service + window event listeners | `ErrorBoundaryService`, `window.addEventListener` |
| API failures | Retry with exponential backoff | `fetchWithErrorHandling`, retry counter, delay |
| Navigation errors | Route guards + error pages | `canLoad`, `loading`, error routes |
| Form validation | Inline field errors + submit prevention | `ValidationController`, `validation-errors` |
| Async timeouts | Promise.race with timeout | `withTimeout`, `TimeoutError` |
| Optimistic updates | State snapshot + rollback | Save original state, try/catch with restore |

## Best practices

1. **Always show user feedback**: Never fail silently - users should know when something goes wrong
2. **Provide recovery actions**: Include "Retry", "Go Home", or "Dismiss" buttons
3. **Log errors for debugging**: Use `ErrorBoundaryService` or similar to track errors
4. **Use appropriate error granularity**: Global errors for critical failures, inline errors for forms
5. **Test error paths**: Don't just test happy paths - simulate failures and verify recovery
6. **Avoid error cascades**: Handle errors at the appropriate level to prevent bubbling
7. **Use loading states**: Show when async operations are in progress
8. **Set reasonable timeouts**: Don't let users wait indefinitely
9. **Make errors actionable**: Tell users what they can do to fix the problem

## See also

- [Validation outcome recipes](../aurelia-packages/validation/outcome-recipes.md) - Field validation errors
- [Fetch client outcome recipes](../aurelia-packages/fetch-client/outcome-recipes.md) - API error handling
- [State outcome recipes](../aurelia-packages/state-outcome-recipes.md) - State mutation error recovery
- [Router hooks](../router/hooks-and-navigation-lifecycle.md) - Navigation error handling
