# Google Gemini CLI Configuration Example for Aurelia Projects

This document shows how to configure Google Gemini CLI for effective Aurelia development, leveraging its massive 1M token context window and open-source extensibility.

## Gemini CLI Overview

Google Gemini CLI is an open-source AI agent that brings Gemini directly into your terminal with:
- **1M token context window**: Can process entire large codebases
- **Free tier**: 1,000 requests per day, 60 per minute at no charge  
- **MCP server support**: Extensible through Model Context Protocol
- **Multimodal capabilities**: Can work with PDFs, sketches, and images
- **ReAct loop**: Uses reason and act patterns for complex tasks

## Initial Setup and Configuration

### Installation and Authentication

```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Authenticate with personal Google account for free tier
gemini auth login

# Verify installation
gemini --version
```

### Basic Configuration

Create a project-specific configuration for Aurelia development:

```bash
# Initialize Gemini CLI in your Aurelia project
cd your-aurelia-project
gemini init
```

## System Prompts for Aurelia Development

### Core Aurelia Context

```markdown
# Aurelia 2.x Development Assistant

You are an expert Aurelia 2.x developer. Key context about this project:

## Framework Information
- Aurelia 2.x TypeScript application using modern syntax
- Architecture: MVVM with dependency injection via @aurelia/kernel
- Components use @customElement decorator, not NgModules
- Lifecycle: creating → created → binding → bound → attaching → attached → detaching → unbinding
- Services registered with @singleton or @transient decorators

## Project Structure
```
aurelia-project/
├── packages/                 # Core framework packages  
│   └── __tests__/           # Tests (require build first)
├── src/
│   ├── components/          # Custom elements (kebab-case)
│   ├── services/           # DI services
│   └── value-converters/   # Value converters & behaviors
└── package.json
```

## Critical Build Requirements
- ALWAYS run `npm run build` after changes to packages/
- Build is required before running any tests
- Use `npm run dev -- -t "pattern"` for targeted testing
- Tests located in packages/__tests__/ directory

## Code Standards
- TypeScript strict mode enabled - never use `any`
- Bindable properties must have explicit types
- Custom elements use kebab-case: `<user-profile>`
- Classes use PascalCase: `UserProfileCustomElement`
- Always implement proper cleanup in unbinding() hook
- Use early returns, prefer const over let
```

### Advanced Development Patterns

```markdown
## Aurelia Component Patterns

### Standard Custom Element
```typescript
import { customElement, bindable } from '@aurelia/runtime-html';

@customElement({
  name: 'user-profile',
  template: `<div class="user-profile">
    <h3>\${user.name}</h3>
    <p>\${user.email}</p>
  </div>`
})
export class UserProfile {
  @bindable public user?: User;
  @bindable public readonly?: boolean = false;
  
  public binding(): void {
    // Initialization logic
    this.validateUser();
  }
  
  public unbinding(): void {
    // Cleanup: remove listeners, clear timers, etc.
  }
  
  private validateUser(): void {
    if (!this.user) {
      throw new Error('UserProfile requires a user object');
    }
  }
}
```

### Service Pattern
```typescript
import { resolve } from '@aurelia/kernel';
import { singleton } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export interface User {
  id: string;
  name: string;
  email: string;
}

@singleton
export class UserService {
  private readonly http = resolve(IHttpClient);

  public async getUser(id: string): Promise<User> {
    try {
      const response = await this.http.fetch(`/api/users/${id}`);
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to fetch user', { id, error });
      throw new Error(`Unable to load user ${id}`);
    }
  }
}
```

### Testing Pattern
```typescript
import { TestContext, assert } from '@aurelia/testing';
import { UserProfile } from '../user-profile';

describe('UserProfile', () => {
  it('should render user information correctly', async () => {
    // Arrange
    const ctx = TestContext.create();
    const { component } = ctx.createComponent(UserProfile);
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    
    // Act
    component.user = mockUser;
    await ctx.startPromise;
    
    // Assert
    assert.includes(ctx.host.textContent, mockUser.name);
    assert.includes(ctx.host.textContent, mockUser.email);
  });
});
```
```

## MCP Server Configuration

Gemini CLI supports MCP servers for enhanced functionality:

### Aurelia-Specific MCP Server

```json
{
  "mcpServers": {
    "aurelia-dev": {
      "command": "node",
      "args": ["aurelia-mcp-server.js"],
      "env": {
        "AURELIA_PROJECT_ROOT": "."
      }
    }
  }
}
```

### Custom MCP Tools for Aurelia

```javascript
// aurelia-mcp-server.js
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

const server = new Server({
  name: 'aurelia-dev-server',
  version: '1.0.0'
});

// Tool for generating Aurelia components
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'generate_aurelia_component') {
    const { name, bindables, lifecycle } = request.params.arguments;
    
    return {
      content: [{
        type: 'text',
        text: generateAureliaComponent(name, bindables, lifecycle)
      }]
    };
  }
});

// Tool for running Aurelia build + test sequence
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'aurelia_test_sequence') {
    const { pattern } = request.params.arguments;
    
    // Run build first, then tests
    const buildResult = await exec('npm run build');
    if (buildResult.code === 0) {
      const testResult = await exec(`npm run dev -- -t "${pattern}"`);
      return { content: [{ type: 'text', text: testResult.stdout }] };
    }
    
    return { content: [{ type: 'text', text: `Build failed: ${buildResult.stderr}` }] };
  }
});
```

## Effective Usage Patterns

### Component Generation

```bash
# Generate a complete Aurelia component with tests
gemini "Create a shopping-cart-item custom element that:
- Has bindable properties: item (CartItem), quantity (number), readonly (boolean)
- Implements binding() and unbinding() lifecycle hooks
- Includes quantity change methods with validation  
- Has comprehensive tests using @aurelia/testing
- Follows our TypeScript strict mode requirements"
```

### Service Development

```bash
# Generate a service with proper DI patterns
gemini "Create a ProductService that:
- Uses @singleton decorator
- Injects IHttpClient for API calls
- Has methods: getProduct(id), searchProducts(query), updateProduct(product)
- Implements proper error handling and logging
- Includes TypeScript interfaces for all data types
- Has complete unit tests with mocked HTTP calls"
```

### Codebase Analysis

```bash
# Leverage the 1M token context for large codebase analysis
gemini "Analyze this entire Aurelia project and identify:
- Components that don't implement proper cleanup in unbinding()
- Services that could benefit from better error handling  
- Test files that need to be updated for the latest patterns
- Opportunities to modernize code to current Aurelia 2.x best practices"
```

### Debugging Complex Issues

```bash
# Multi-file debugging with full context
gemini "I'm having an issue where the UserProfile component isn't updating when the user property changes. Here's the relevant code: @src/components/user-profile.ts @src/services/user-service.ts @src/app.ts

Please analyze the binding flow and identify why the component isn't reactive to property changes."
```

## Advanced Features

### Multimodal Development

```bash
# Work with design mockups or architecture diagrams
gemini "Based on this UI mockup [attach image], generate an Aurelia component structure that implements this design with proper responsive behavior and accessibility features"

# Convert PDF specifications to code
gemini "From this API specification PDF [attach file], generate Aurelia service classes with proper TypeScript interfaces and error handling"
```

### Large Refactoring Tasks

```bash
# Leverage large context for major refactoring
gemini "Refactor this entire Aurelia application to:
- Migrate from constructor injection to property injection where appropriate
- Update all components to use modern lifecycle patterns
- Add proper TypeScript types throughout
- Ensure all custom elements follow kebab-case naming conventions
- Update tests to use latest @aurelia/testing patterns"
```

## Configuration Best Practices

### Project-Level Configuration

Create a `.gemini/config.json` file:

```json
{
  "systemPrompt": "./aurelia-system-prompt.md",
  "defaultModel": "gemini-2.5-pro",
  "maxTokens": 1000000,
  "temperature": 0.1,
  "topP": 0.8,
  "contextFiles": [
    "package.json",
    "tsconfig.json", 
    "CLAUDE.md",
    "src/**/*.ts"
  ],
  "excludePatterns": [
    "node_modules/**",
    "dist/**",
    "*.log"
  ]
}
```

### Team Collaboration

Version control your Gemini CLI configuration:

```bash
# Include in your repository
.gemini/
├── config.json           # Team configuration
├── aurelia-prompts/      # Shared prompt templates
│   ├── component.md
│   ├── service.md
│   └── testing.md
└── mcp-servers/          # Custom MCP server configurations
    └── aurelia-server.js
```

## Integration with Development Workflow

### Pre-commit Hooks

```bash
# Use Gemini CLI in git hooks
#!/bin/bash
# .git/hooks/pre-commit
gemini "Review these staged changes for Aurelia best practices, TypeScript compliance, and potential issues before commit"
```

### Continuous Integration

```yaml
# .github/workflows/ai-review.yml
- name: AI Code Review
  run: |
    gemini "Analyze the changes in this PR for:
    - Aurelia convention compliance
    - TypeScript type safety
    - Test coverage
    - Performance implications
    - Security considerations"
```

## Troubleshooting

### Rate Limiting
- Free tier: 60 requests/minute, 1,000/day
- Plan usage with `gemini quota` command
- Use efficient prompts to maximize free tier value

### Context Window Management
- 1M tokens can handle very large codebases
- Use file exclusion patterns for better performance
- Focus context on relevant files for specific tasks

### Model Performance
- Use temperature 0.1-0.3 for code generation
- Higher temperature (0.7-0.9) for creative/exploratory tasks
- Adjust topP based on desired response diversity

## Security Considerations

- Review generated code for security implications
- Never include API keys or secrets in prompts
- Use MCP servers for sensitive operations
- Validate AI suggestions against Aurelia security best practices

Gemini CLI's large context window and extensibility make it particularly powerful for understanding and working with complex Aurelia applications, while the free tier provides generous usage limits for individual developers.