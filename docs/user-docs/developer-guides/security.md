# Security Guide

Comprehensive security guidance for building secure Aurelia 2 applications.

{% hint style="danger" %}
**Critical Security Principle**

The client cannot be trusted. All security enforcement must happen on the backend. Your Aurelia application's security measures are for user experience and first-line defense only. Always validate, authenticate, and authorize on the server.
{% endhint %}

{% hint style="success" %}
**What you'll learn...**

* How Aurelia protects against XSS attacks in templates
* Authentication and authorization patterns using the router
* CSRF protection strategies
* Content Security Policy (CSP) configuration
* Secure data handling and storage
* Input validation and sanitization
{% endhint %}

## Table of Contents

- [XSS Prevention in Templates](#xss-prevention-in-templates)
- [Authentication Patterns](#authentication-patterns)
- [Authorization with Route Guards](#authorization-with-route-guards)
- [CSRF Protection](#csrf-protection)
- [Content Security Policy](#content-security-policy)
- [Secure Token Storage](#secure-token-storage)
- [Input Validation and Sanitization](#input-validation-and-sanitization)
- [Secure Communication](#secure-communication)
- [Security Checklist](#security-checklist)

---

## XSS Prevention in Templates

Cross-Site Scripting (XSS) is one of the most common web vulnerabilities. Aurelia provides built-in protections, but you must understand when they apply.

### Text Interpolation (Safe by Default)

Text interpolation using `${}` is **automatically escaped** and safe from XSS:

```html
<!-- SAFE: Text interpolation auto-escapes HTML -->
<div>${userInput}</div>
<p>Welcome, ${username}!</p>

<!-- Even if userInput contains: <script>alert('xss')</script>
     It will be rendered as text, not executed -->
```

**How it works**: Aurelia sets the `textContent` property, not `innerHTML`, so the browser automatically escapes HTML entities.

### Attribute Binding (Safe by Default)

Attribute bindings are also safe when using standard binding commands:

```html
<!-- SAFE: Attribute values are properly escaped -->
<input value.bind="userInput">
<a href.bind="userProvidedUrl">Link</a>
<img src.bind="userImageUrl" alt.bind="userDescription">
```

{% hint style="warning" %}
**URL Injection Risk**

While attribute binding escapes HTML, malicious URLs can still be dangerous:
```html
<!-- Potentially dangerous -->
<a href.bind="userUrl">Click me</a>
<!-- If userUrl = "javascript:alert('xss')" this will execute -->
```

**Solution**: Validate URLs before binding:
```typescript
sanitizeUrl(url: string): string {
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  try {
    const parsed = new URL(url, window.location.href);
    if (allowedProtocols.includes(parsed.protocol)) {
      return url;
    }
  } catch {
    // Invalid URL
  }
  return '#'; // Safe fallback
}
```
{% endhint %}

### innerHTML Binding (Dangerous - Requires Sanitization)

The `innerHTML` binding is where XSS vulnerabilities occur. **Never** bind user input directly to `innerHTML` without sanitization.

{% tabs %}
{% tab title="Unsafe (Vulnerable to XSS)" %}
```html
<!-- DANGEROUS: User input rendered as HTML -->
<div innerHTML.bind="userContent"></div>

<!-- If userContent contains: <img src=x onerror="alert('xss')">
     It will execute the malicious script -->
```
{% endtab %}

{% tab title="Safe (Using Sanitize Value Converter)" %}
```html
<!-- SAFE: Content is sanitized before rendering -->
<div innerHTML.bind="userContent | sanitize"></div>
```
{% endtab %}
{% endtabs %}

### Implementing HTML Sanitization

Aurelia provides a `sanitize` value converter interface but requires you to provide the sanitization implementation.

**Step 1: Install a sanitization library**

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Step 2: Create a sanitizer service**

```typescript
// src/services/html-sanitizer.ts
import { DI } from '@aurelia/kernel';
import { ISanitizer } from '@aurelia/runtime-html';
import DOMPurify from 'dompurify';

export class HtmlSanitizer implements ISanitizer {
  sanitize(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }
}

// Register as the ISanitizer implementation
export const HtmlSanitizerRegistration = DI.createInterface<ISanitizer>(
  'ISanitizer',
  x => x.singleton(HtmlSanitizer)
);
```

**Step 3: Register the sanitizer**

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { HtmlSanitizerRegistration } from './services/html-sanitizer';

Aurelia
  .register(HtmlSanitizerRegistration)
  .app(component)
  .start();
```

**Step 4: Use in templates**

```html
<!-- Now the sanitize value converter will use your implementation -->
<div innerHTML.bind="userContent | sanitize"></div>
```

{% hint style="info" %}
**DOMPurify Configuration**

Customize DOMPurify based on your needs:
- `ALLOWED_TAGS`: Whitelist of allowed HTML tags
- `ALLOWED_ATTR`: Whitelist of allowed attributes
- `FORBID_TAGS`: Blacklist of forbidden tags
- `FORBID_ATTR`: Blacklist of forbidden attributes

See [DOMPurify documentation](https://github.com/cure53/DOMPurify) for all options.
{% endhint %}

### Expression Parser Security

Aurelia's binding expression parser has built-in security features:

**Restricted Globals**: Only safe globals are accessible in binding expressions:

```html
<!-- ALLOWED: Safe built-in functions -->
<div>${JSON.stringify(data)}</div>
<div>${Math.round(price)}</div>
<div>${parseInt(value)}</div>

<!-- BLOCKED: Dangerous globals not accessible -->
<div>${window.location.href}</div> <!-- Error: window is not accessible -->
<div>${document.cookie}</div>      <!-- Error: document is not accessible -->
<div>${eval('malicious')}</div>    <!-- Error: eval is not accessible -->
```

**Allowed globals**: `Array`, `Boolean`, `Date`, `JSON`, `Math`, `Number`, `Object`, `RegExp`, `String`, `Intl`, `Map`, `Set`, `BigInt`, `Infinity`, `NaN`, `isFinite`, `isNaN`, `parseFloat`, `parseInt`, `decodeURI`, `decodeURIComponent`, `encodeURI`, `encodeURIComponent`

**No eval or Function constructor**: Aurelia never uses `eval()` or `new Function()`, making it safe for Content Security Policy (CSP).

---

## Authentication Patterns

Authentication verifies user identity. Aurelia provides the tools to create robust authentication flows using dependency injection and router hooks.

### Creating an Authentication Service

Use Aurelia's DI container to create a singleton authentication service:

```typescript
// src/services/auth-service.ts
import { DI, resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export interface IAuthService {
  isAuthenticated(): boolean;
  login(credentials: Credentials): Promise<void>;
  logout(): Promise<void>;
  getToken(): string | null;
}

export const IAuthService = DI.createInterface<IAuthService>(
  'IAuthService',
  x => x.singleton(AuthService)
);

export interface Credentials {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export class AuthService implements IAuthService {
  private token: string | null = null;
  private user: AuthResponse['user'] | null = null;
  private http = resolve(IHttpClient);

  constructor() {
    // Restore auth state from storage on initialization
    this.token = sessionStorage.getItem('auth_token');
    const userJson = sessionStorage.getItem('auth_user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
      } catch {
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  async login(credentials: Credentials): Promise<void> {
    const response = await this.http.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: AuthResponse = await response.json();

    this.token = data.token;
    this.user = data.user;

    // Store auth state (see "Secure Token Storage" section)
    sessionStorage.setItem('auth_token', this.token);
    sessionStorage.setItem('auth_user', JSON.stringify(this.user));
  }

  async logout(): Promise<void> {
    // Notify server
    if (this.token) {
      await this.http.fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      }).catch(() => {
        // Ignore errors on logout
      });
    }

    // Clear local state
    this.token = null;
    this.user = null;
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser() {
    return this.user;
  }
}
```

### Adding Authentication Headers

Use an HTTP interceptor to automatically add authentication tokens to requests:

```typescript
// src/interceptors/auth-interceptor.ts
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import { IAuthService } from '../services/auth-service';

export class AuthInterceptor {
  private http = resolve(IHttpClient);
  private auth = resolve(IAuthService);

  register() {
    this.http.configure(config => {
      config.useInterceptor({
        request(request) {
          const token = this.auth.getToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
          return request;
        }.bind(this),

        response(response) {
          // Handle 401 Unauthorized
          if (response.status === 401) {
            this.auth.logout();
            window.location.href = '/login';
          }
          return response;
        }.bind(this)
      });
    });
  }
}
```

Register the interceptor during app startup:

```typescript
// src/main.ts
import Aurelia, { AppTask } from 'aurelia';
import { AuthInterceptor } from './interceptors/auth-interceptor';

Aurelia
  .register(
    AppTask.creating(AuthInterceptor, interceptor => interceptor.register())
  )
  .app(component)
  .start();
```

### Login Component Example

```typescript
// src/pages/login.ts
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { IAuthService, Credentials } from '../services/auth-service';

export class Login {
  private credentials: Credentials = { username: '', password: '' };
  private error: string = '';
  private loading: boolean = false;
  private auth = resolve(IAuthService);
  private router = resolve(IRouter);

  async login() {
    this.error = '';
    this.loading = true;

    try {
      await this.auth.login(this.credentials);
      await this.router.load('/dashboard');
    } catch (err) {
      this.error = 'Invalid username or password';
    } finally {
      this.loading = false;
    }
  }
}
```

```html
<!-- src/pages/login.html -->
<form submit.trigger="login()">
  <h1>Login</h1>

  <div if.bind="error" class="error">
    ${error}
  </div>

  <div>
    <label>
      Username:
      <input type="text" value.bind="credentials.username" disabled.bind="loading">
    </label>
  </div>

  <div>
    <label>
      Password:
      <input type="password" value.bind="credentials.password" disabled.bind="loading">
    </label>
  </div>

  <button type="submit" disabled.bind="loading">
    ${loading ? 'Logging in...' : 'Login'}
  </button>
</form>
```

---

## Authorization with Route Guards

Authorization determines what authenticated users can access. Use Aurelia's router lifecycle hooks to implement route guards.

### Basic Route Guard with canLoad

The `canLoad` hook runs before navigating to a route. Return `false` or a redirect to prevent access:

```typescript
// src/pages/dashboard.ts
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';
import type { RouteNode, Params } from '@aurelia/router';

export class Dashboard {
  private auth = resolve(IAuthService);
  private router = resolve(IRouter);

  canLoad(params: Params, next: RouteNode, current: RouteNode | null) {
    if (!this.auth.isAuthenticated()) {
      // Redirect to login
      return this.router.load('/login', {
        queryParams: { returnUrl: next.computeAbsolutePath() }
      });
    }
    return true;
  }
}
```

### Role-Based Authorization

Extend the auth service to support roles:

```typescript
// src/services/auth-service.ts
export interface IAuthService {
  // ... existing methods
  hasRole(role: string): boolean;
  hasAnyRole(...roles: string[]): boolean;
  hasAllRoles(...roles: string[]): boolean;
}

export class AuthService implements IAuthService {
  private roles: string[] = [];

  // ... existing implementation

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(...roles: string[]): boolean {
    return roles.some(role => this.roles.includes(role));
  }

  hasAllRoles(...roles: string[]): boolean {
    return roles.every(role => this.roles.includes(role));
  }
}
```

Use role checks in route guards:

```typescript
// src/pages/admin.ts
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

export class AdminPanel {
  private auth = resolve(IAuthService);
  private router = resolve(IRouter);

  canLoad() {
    if (!this.auth.isAuthenticated()) {
      return this.router.load('/login');
    }

    if (!this.auth.hasRole('admin')) {
      // Redirect to forbidden page or home
      return this.router.load('/forbidden');
    }

    return true;
  }
}
```

### Reusable Authorization Guard

Create a reusable guard for multiple routes:

```typescript
// src/guards/require-auth.ts
import { DI } from '@aurelia/kernel';
import { IRouter, RouteNode, Params } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

export interface IRequireAuthOptions {
  roles?: string[];
  requireAll?: boolean; // Require all roles or any role
  redirectTo?: string;
}

export const IRequireAuth = DI.createInterface<IRequireAuth>('IRequireAuth');

export interface IRequireAuth {
  canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options?: IRequireAuthOptions
  ): boolean | Promise<boolean> | any;
}

export class RequireAuth implements IRequireAuth {
  private auth = resolve(IAuthService);
  private router = resolve(IRouter);

  canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: IRequireAuthOptions = {}
  ) {
    const { roles, requireAll = false, redirectTo = '/login' } = options;

    // Check authentication
    if (!this.auth.isAuthenticated()) {
      return this.router.load(redirectTo, {
        queryParams: { returnUrl: next.computeAbsolutePath() }
      });
    }

    // Check authorization
    if (roles && roles.length > 0) {
      const hasAccess = requireAll
        ? this.auth.hasAllRoles(...roles)
        : this.auth.hasAnyRole(...roles);

      if (!hasAccess) {
        return this.router.load('/forbidden');
      }
    }

    return true;
  }
}
```

Use the reusable guard:

```typescript
// src/pages/reports.ts
import { resolve } from '@aurelia/kernel';
import { IRequireAuth } from '../guards/require-auth';

export class Reports {
  private requireAuth = resolve(IRequireAuth);

  canLoad(params: Params, next: RouteNode, current: RouteNode | null) {
    return this.requireAuth.canLoad(params, next, current, {
      roles: ['admin', 'manager'],
      requireAll: false // Any of these roles
    });
  }
}
```

### Protecting Multiple Routes

Apply guards to multiple routes via route configuration:

```typescript
// src/my-app.ts
import { route } from '@aurelia/router';
import { Dashboard } from './pages/dashboard';
import { Reports } from './pages/reports';
import { AdminPanel } from './pages/admin';

@route({
  routes: [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard }, // Has its own canLoad
    { path: 'reports', component: Reports },     // Has its own canLoad
    { path: 'admin', component: AdminPanel },    // Has its own canLoad
  ]
})
export class MyApp {}
```

---

## CSRF Protection

Cross-Site Request Forgery (CSRF) attacks trick authenticated users into making unwanted requests. Protect against CSRF using tokens.

### CSRF Token Pattern

**How it works**:
1. Server generates a unique CSRF token per session
2. Token is included in forms or sent with requests
3. Server validates the token on state-changing requests (POST, PUT, DELETE)

### Implementation with Meta Tag

Many frameworks provide CSRF tokens via meta tags:

```html
<!-- Server renders this in your main HTML -->
<meta name="csrf-token" content="abc123...">
```

Read and send the token with requests:

```typescript
// src/services/csrf.ts
import { DI } from '@aurelia/kernel';

export const ICsrfService = DI.createInterface<ICsrfService>(
  'ICsrfService',
  x => x.singleton(CsrfService)
);

export interface ICsrfService {
  getToken(): string | null;
}

export class CsrfService implements ICsrfService {
  private token: string | null;

  constructor() {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    this.token = meta?.content ?? null;
  }

  getToken(): string | null {
    return this.token;
  }
}
```

Add CSRF token to requests via interceptor:

```typescript
// src/interceptors/csrf-interceptor.ts
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import { ICsrfService } from '../services/csrf';

export class CsrfInterceptor {
  private http = resolve(IHttpClient);
  private csrf = resolve(ICsrfService);

  register() {
    this.http.configure(config => {
      config.useInterceptor({
        request(request) {
          // Add CSRF token to state-changing requests
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
            const token = this.csrf.getToken();
            if (token) {
              request.headers.set('X-CSRF-Token', token);
            }
          }
          return request;
        }.bind(this)
      });
    });
  }
}
```

### SameSite Cookies

Modern browsers support the `SameSite` cookie attribute, which provides automatic CSRF protection:

```
Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly
```

**Server configuration (example with Express.js)**:

```javascript
app.use(session({
  cookie: {
    sameSite: 'strict', // or 'lax'
    secure: true,       // HTTPS only
    httpOnly: true      // Not accessible via JavaScript
  }
}));
```

{% hint style="info" %}
**SameSite Options**

- `Strict`: Cookie never sent in cross-site requests (strongest protection)
- `Lax`: Cookie sent on top-level navigation (GET), not on cross-site POST
- `None`: Cookie sent in all contexts (requires `Secure` flag)

For most applications, `SameSite=Lax` provides good CSRF protection without breaking legitimate use cases.
{% endhint %}

---

## Content Security Policy

Content Security Policy (CSP) is an HTTP header that tells browsers which resources are allowed to load, preventing XSS and data injection attacks.

### Aurelia's CSP Compatibility

Aurelia is **fully compatible** with strict CSP policies because:
- ✅ No use of `eval()` or `new Function()`
- ✅ Templates are pre-compiled, not evaluated at runtime
- ✅ All code is in JavaScript files, not inline scripts

### Recommended CSP Configuration

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

**Explanation**:
- `default-src 'self'`: Only allow resources from same origin
- `script-src 'self'`: Only load scripts from your domain (no inline scripts)
- `style-src 'self' 'unsafe-inline'`: Allow inline styles (needed for style attribute bindings)
- `connect-src 'self' https://api.example.com`: Allow AJAX to your API
- `frame-ancestors 'none'`: Prevent clickjacking (same as X-Frame-Options: DENY)

{% hint style="warning" %}
**Inline Styles in Aurelia**

Aurelia's `style` attribute binding generates inline styles:
```html
<div style.bind="dynamicStyles"></div>
```

This requires `'unsafe-inline'` in `style-src`. For stricter CSP:
- Use CSS classes instead of inline styles
- Use `style-src 'self' 'nonce-...'` with nonces (advanced)
{% endhint %}

### Testing Your CSP

Use **report-only mode** during development to find violations without blocking resources:

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

Browser console will show CSP violations, and violations will be POSTed to `/csp-report` endpoint.

### CSP Best Practices

1. **Start strict, then relax if needed** - Begin with `default-src 'self'` and add exceptions
2. **Never use `'unsafe-eval'`** - Aurelia doesn't need it
3. **Avoid `'unsafe-inline'` for scripts** - Aurelia doesn't need it for scripts
4. **Use HTTPS only** - `upgrade-insecure-requests` directive
5. **Test thoroughly** - Use report-only mode first

---

## Secure Token Storage

How you store authentication tokens affects security. Each method has trade-offs.

### Storage Options Comparison

| Storage Method | XSS Vulnerable | CSRF Vulnerable | Persists on Close | Accessible via JS |
|----------------|----------------|-----------------|-------------------|-------------------|
| **localStorage** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **sessionStorage** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Cookie (HttpOnly)** | ❌ No | ✅ Yes (without SameSite) | ✅ Yes | ❌ No |
| **Memory only** | ❌ No | ❌ No | ❌ No | ⚠️ Limited |

### Recommended Approach: HttpOnly Cookies

**Most secure option**: Store tokens in `HttpOnly` cookies set by the server.

**Server sets cookie**:
```
Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict; Path=/
```

**Benefits**:
- ✅ Not accessible via JavaScript (prevents XSS token theft)
- ✅ Automatically sent with requests (no client-side code needed)
- ✅ `SameSite` attribute prevents CSRF

**Client-side implementation**:
```typescript
// src/services/auth-service.ts
export class AuthService implements IAuthService {
  // No token storage in JavaScript!
  // Token is in HttpOnly cookie managed by server

  async login(credentials: Credentials): Promise<void> {
    const response = await this.http.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      credentials: 'include' // Include cookies in request
    });

    if (response.ok) {
      // Server sets HttpOnly cookie
      // No need to store token in JavaScript
      this.authenticated = true;
    }
  }

  async logout(): Promise<void> {
    await this.http.fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    this.authenticated = false;
  }

  async checkAuth(): Promise<boolean> {
    const response = await this.http.fetch('/api/auth/me', {
      credentials: 'include'
    });
    this.authenticated = response.ok;
    return this.authenticated;
  }
}
```

Configure fetch client to include cookies:

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { IHttpClient } from '@aurelia/fetch-client';

Aurelia.register({
  register(container) {
    const http = container.get(IHttpClient);
    http.configure(config => {
      config
        .withBaseUrl('https://api.example.com')
        .withDefaults({
          credentials: 'include', // Always include cookies
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
    });
  }
});
```

### Alternative: sessionStorage with Short Expiry

If you must store tokens in JavaScript (e.g., token-based API without cookies):

**Best practices**:
1. Use `sessionStorage` instead of `localStorage` (cleared on tab close)
2. Use short-lived tokens (15-30 minutes)
3. Implement refresh token rotation
4. Clear on logout

```typescript
export class AuthService implements IAuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'refresh_token';

  async login(credentials: Credentials): Promise<void> {
    const response = await this.http.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    const { accessToken, refreshToken } = await response.json();

    // Store in sessionStorage (cleared on tab close)
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);
    sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  async refreshAccessToken(): Promise<void> {
    const refreshToken = sessionStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await this.http.fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    });

    const { accessToken } = await response.json();
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
  }
}
```

{% hint style="danger" %}
**Never Store Sensitive Data in localStorage/sessionStorage**

If an XSS vulnerability exists, attackers can steal tokens from localStorage/sessionStorage. HttpOnly cookies are much safer.
{% endhint %}

---

## Input Validation and Sanitization

Always validate and sanitize user input—both client-side and server-side.

### Client-Side Validation

Use Aurelia's validation plugin for user experience:

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class UserForm {
  private user = {
    email: '',
    age: null,
    website: ''
  };

  private validation = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.validationRules
      .on(this.user)
      .ensure('email')
        .required()
        .email()
        .maxLength(255)
      .ensure('age')
        .required()
        .satisfies((value: number) => value >= 18 && value <= 120)
        .withMessage('Age must be between 18 and 120')
      .ensure('website')
        .satisfiesRule('url') // Custom rule
        .maxLength(2048);
  }

  async submit() {
    const result = await this.validation.validate();
    if (!result.valid) {
      return; // Show validation errors
    }

    // Submit to server
    await this.saveUser(this.user);
  }
}
```

**See**: [Validation documentation](../aurelia-packages/validation/README.md) for complete guide.

### Custom Validation Rules

Create custom validators for security-sensitive inputs:

```typescript
// src/validation/custom-rules.ts
import { IValidationRules } from '@aurelia/validation';

export function registerCustomRules(rules: IValidationRules) {
  // URL validation
  rules.customRule(
    'url',
    (value: string) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    'Must be a valid HTTP/HTTPS URL'
  );

  // Safe filename (no path traversal)
  rules.customRule(
    'safeFilename',
    (value: string) => {
      if (!value) return true;
      return !/[\/\\]/.test(value) && !/^\.\./.test(value);
    },
    'Invalid filename'
  );

  // No HTML tags
  rules.customRule(
    'noHtml',
    (value: string) => {
      if (!value) return true;
      return !/<[^>]*>/.test(value);
    },
    'HTML tags are not allowed'
  );
}
```

### Server-Side Validation (Critical)

**Client-side validation is for UX only**. Always re-validate on the server:

```typescript
// Example: Server-side validation (Node.js/Express)
app.post('/api/users', async (req, res) => {
  // Validate input
  const errors = [];

  if (!isEmail(req.body.email)) {
    errors.push({ field: 'email', message: 'Invalid email' });
  }

  if (req.body.age < 18 || req.body.age > 120) {
    errors.push({ field: 'age', message: 'Invalid age' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize input before saving
  const user = {
    email: validator.normalizeEmail(req.body.email),
    age: parseInt(req.body.age, 10),
    name: sanitizeHtml(req.body.name, { allowedTags: [] }) // Strip all HTML
  };

  await db.users.create(user);
  res.json({ success: true });
});
```

{% hint style="warning" %}
**Never Trust Client Input**

An attacker can bypass client-side validation using browser dev tools or by crafting HTTP requests directly. Always validate and sanitize on the server.
{% endhint %}

---

## Secure Communication

### HTTPS Only

**Always use HTTPS in production**. HTTP transmits data in plaintext, exposing:
- Passwords and tokens
- Session cookies
- User data
- API requests/responses

**Enforce HTTPS**:
1. Redirect HTTP to HTTPS (server configuration)
2. Use HSTS header:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```
3. Use `Secure` flag on cookies

**Check protocol in app**:
```typescript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
```

### API Security

**Configure fetch client securely**:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class ApiConfig {
  static configure(http: IHttpClient) {
    http.configure(config => {
      config
        .withBaseUrl('https://api.example.com')
        .withDefaults({
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        .withInterceptor({
          request(request) {
            // Add security headers
            request.headers.set('X-Requested-With', 'XMLHttpRequest');
            return request;
          },

          response(response) {
            // Validate response
            const contentType = response.headers.get('Content-Type');
            if (!contentType?.includes('application/json')) {
              throw new Error('Invalid response type');
            }
            return response;
          }
        });
    });
  }
}
```

**See**: [Fetch Client documentation](../aurelia-packages/fetch-client/overview.md)

---

## Security Checklist

Use this checklist to audit your Aurelia application security:

### Templates & Data Binding

- [ ] Using text interpolation `${}` for user content (auto-escaped)
- [ ] Never binding user input to `innerHTML` without sanitization
- [ ] Using `innerHTML.bind="content | sanitize"` when HTML is needed
- [ ] Validating URLs before binding to `href` or `src`
- [ ] Registered a sanitizer implementation (DOMPurify or similar)

### Authentication

- [ ] Authentication service uses DI singleton pattern
- [ ] Passwords never transmitted in plain text
- [ ] Using HTTPS for all authentication requests
- [ ] Login failures don't reveal whether username or password was wrong
- [ ] Account lockout after multiple failed login attempts
- [ ] Session/token has reasonable expiration time
- [ ] Logout clears all client-side auth state

### Authorization

- [ ] Route guards implemented using `canLoad` lifecycle hook
- [ ] Authorization checks happen on both client and server
- [ ] User roles/permissions verified server-side
- [ ] Sensitive routes protected with role checks
- [ ] Authorization failures don't leak information about protected resources

### Token Storage

- [ ] Using HttpOnly cookies for tokens (preferred), OR
- [ ] Using sessionStorage (not localStorage) with short expiry
- [ ] Tokens never stored in URL parameters
- [ ] Tokens never logged or exposed in error messages
- [ ] Refresh token rotation implemented (if applicable)

### CSRF Protection

- [ ] CSRF tokens used for state-changing requests, OR
- [ ] Using SameSite cookies with appropriate value (Lax/Strict)
- [ ] Custom headers (e.g., `X-Requested-With`) on AJAX requests

### Content Security Policy

- [ ] CSP header configured (start with report-only mode)
- [ ] No `'unsafe-eval'` in CSP (Aurelia doesn't need it)
- [ ] Minimize `'unsafe-inline'` usage
- [ ] CSP violations monitored and addressed

### Input Validation

- [ ] Client-side validation for UX
- [ ] Server-side validation for security (always)
- [ ] Input sanitization before storage
- [ ] Length limits on text fields
- [ ] Type validation (numbers, emails, URLs, etc.)
- [ ] File upload validation (type, size, content)

### Communication Security

- [ ] HTTPS enforced in production
- [ ] HSTS header configured
- [ ] Secure and HttpOnly flags on cookies
- [ ] No sensitive data in URLs or logs
- [ ] API endpoints use authentication
- [ ] CORS configured with specific origins (not `*`)

### Error Handling

- [ ] Error messages don't leak sensitive information
- [ ] Stack traces disabled in production
- [ ] Generic error messages shown to users
- [ ] Detailed errors logged server-side only
- [ ] Authentication errors don't reveal if user exists

### Dependencies

- [ ] Dependencies regularly updated (npm audit)
- [ ] No known vulnerabilities in packages
- [ ] Only necessary packages installed
- [ ] Packages from trusted sources

### Deployment

- [ ] Source maps not deployed to production, OR
- [ ] Source maps served only to authenticated developers
- [ ] Environment variables for secrets (not hardcoded)
- [ ] Secrets never committed to version control
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)

---

## Related Documentation

- [Securing an App (Recipe)](./scenarios/securing-an-app.md) - Basic security overview
- [Authentication with Auth0](./scenarios/auth0.md) - Third-party authentication integration
- [Router Hooks](../router/router-hooks.md) - Lifecycle hooks for route guards
- [Validation Plugin](../aurelia-packages/validation/README.md) - Client-side input validation
- [Fetch Client](../aurelia-packages/fetch-client/overview.md) - HTTP client configuration
- [Dependency Injection](../getting-to-know-aurelia/dependency-injection.md) - DI for services

---

## Additional Resources

### External Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Most critical web security risks
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) - Security best practices
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security) - Browser security features
- [Content Security Policy Reference](https://content-security-policy.com/) - CSP guide

### Security Testing Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security scanner
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability scanner
- [Snyk](https://snyk.io/) - Dependency and code security scanner

{% hint style="info" %}
**Stay Informed**

Security is an ongoing process, not a one-time task. Subscribe to security advisories for your backend framework and dependencies. Regularly review and update your security measures.
{% endhint %}
