# Warp Terminal Configuration Example for Aurelia Projects

This document shows how to configure Warp Terminal 2.0's AI features for effective Aurelia development using Agent Mode, Active AI, and system prompts.

## Warp Terminal AI Features Overview

Warp Terminal 2.0 offers several AI-powered features:
- **Agent Mode**: Multi-step autonomous workflows using natural language
- **Active AI**: Context-aware assistance triggered by errors and outputs
- **Warp Dispatch**: Full AI control for building and fixing code (Ctrl + Shift + I)
- **Suggested Prompts**: Reusable prompt templates for common tasks

## System Prompt Configuration

Configure Warp's AI with Aurelia-specific context through system prompts:

### Basic Aurelia Context

```markdown
# Aurelia 2.x Development Context

You are assisting with an Aurelia 2.x TypeScript application. Key context:

## Framework Specifics
- Use modern Aurelia 2.x syntax with @customElement decorator
- Components follow MVVM architecture with clear view/view-model separation
- Dependency injection via @aurelia/kernel with @singleton/@transient decorators
- Lifecycle hooks: creating → created → binding → bound → attaching → attached → detaching → unbinding

## Project Structure
- /packages/ - Core framework packages (requires build before testing)
- /packages/__tests__/ - Test files using @aurelia/testing
- /src/components/ - Custom elements (kebab-case names)
- /src/services/ - Application services with DI registration

## Build Requirements
- ALWAYS run `npm run build` after making changes to packages
- Build is required before running any tests
- Use `npm run dev -- -t "pattern"` for specific test execution
- Run `npm run lint` before committing changes

## Code Standards
- TypeScript strict mode - no `any` types
- Prefer const over let, never use var
- Use explicit types for all bindable properties
- Implement proper cleanup in unbinding() lifecycle hook
```

### Advanced Configuration

For complex development tasks, include specific patterns:

```markdown
## Common Aurelia Patterns

### Custom Element Pattern
```typescript
@customElement({ 
  name: 'user-profile',
  template: '<div class="user-profile">...</div>'
})
export class UserProfile {
  @bindable public user?: User;
  
  public binding(): void {
    // Setup logic
  }
  
  public unbinding(): void {
    // Cleanup subscriptions, timers, etc.
  }
}
```

### Service Pattern
```typescript
import { resolve } from '@aurelia/kernel';
import { singleton } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

@singleton
export class UserService {
  private readonly http = resolve(IHttpClient);

  public async getUser(id: string): Promise<User> {
    // Implementation with proper error handling
  }
}
```

### Testing Pattern
```typescript
// Always build before testing
// Use @aurelia/testing package
// Follow AAA pattern: Arrange, Act, Assert
```
```

## Agent Mode Usage Examples

### Project Setup
Use natural language commands for complex setup tasks:

```bash
# In Warp Terminal Agent Mode
"Set up a new Aurelia component called order-summary that displays order details, includes proper TypeScript types, and has tests"
```

### Code Generation
```bash
"Create a service for managing shopping cart items with add, remove, and calculate total methods, using Aurelia dependency injection patterns"
```

### Debugging and Fixing
```bash
"The UserProfile component isn't updating when the user property changes. Help me debug and fix the binding issue"
```

## Active AI Configuration

Configure Active AI to provide Aurelia-specific assistance for common errors:

### Error Response Patterns

When Warp detects build errors, configure it to suggest:
1. Running `npm run build` for package changes
2. Checking for missing lifecycle hooks
3. Verifying dependency injection setup
4. Confirming TypeScript type definitions

### Command Suggestions

Set up common Aurelia commands as suggested prompts:

```yaml
aurelia_commands:
  - "npm run build && npm run test"
  - "npm run dev -- -t component"
  - "npm run lint && npm run typecheck"
  - "npm run rebuild"  # Clean build for issues
```

## Warp Dispatch Configuration

For autonomous AI development, configure allow/deny lists:

### Safe Commands (Allow List)
```yaml
allow_commands:
  - "npm run build"
  - "npm run test"
  - "npm run lint"
  - "npm run dev -- -t *"
  - "git status"
  - "git diff"
  # Add project-specific safe commands
```

### Restricted Commands (Deny List)
```yaml
deny_commands:
  - "npm publish"
  - "git push"
  - "rm -rf"
  - "sudo *"
  # Prevent potentially destructive operations
```

## MCP Server Integration

Warp Terminal supports Model Context Protocol (MCP) servers for enhanced functionality:

### Aurelia-Specific MCP Server

Configure an MCP server that understands:
- Aurelia project structure and conventions  
- Build requirements and test patterns
- Component lifecycle and DI patterns
- Common debugging scenarios

### Example MCP Tools

```json
{
  "tools": [
    {
      "name": "aurelia_component_generator",
      "description": "Generate Aurelia custom elements with proper structure",
      "parameters": {
        "name": "string",
        "bindables": "array",
        "lifecycle_hooks": "array"
      }
    },
    {
      "name": "aurelia_test_runner", 
      "description": "Run Aurelia tests with proper build sequence",
      "parameters": {
        "pattern": "string",
        "build_first": "boolean"
      }
    }
  ]
}
```

## Suggested Prompts for Common Tasks

Save frequently used prompts for Aurelia development:

### Component Development
```markdown
"Create an Aurelia custom element for [COMPONENT_NAME] that:
- Uses proper TypeScript types
- Implements [LIFECYCLE_HOOKS] lifecycle hooks  
- Has bindable properties: [PROPERTIES]
- Includes basic tests using @aurelia/testing"
```

### Service Development  
```markdown
"Generate an Aurelia service for [SERVICE_PURPOSE] that:
- Uses appropriate DI decorator (@singleton or @transient)
- Implements proper error handling
- Has TypeScript interfaces for all data types
- Includes unit tests"
```

### Debugging Template
```markdown
"Help debug this Aurelia issue:
- Component: [COMPONENT_NAME]
- Problem: [DESCRIPTION]  
- Error messages: [ERRORS]
- Expected behavior: [EXPECTED]
Please check lifecycle hooks, binding setup, and DI configuration"
```

## Integration with Development Workflow

### Pre-commit Workflow
```bash
# Suggested prompt for pre-commit checks
"Run full pre-commit validation: build packages, run tests, lint code, and check types. Report any issues found."
```

### Code Review Preparation
```bash
"Prepare this Aurelia component for code review: check for proper lifecycle implementation, TypeScript types, test coverage, and adherence to project conventions"
```

## Best Practices

### Effective Prompting
- Be specific about Aurelia version (2.x) to avoid outdated suggestions
- Include context about your component's purpose and requirements
- Mention build requirements upfront to avoid test failures
- Specify TypeScript strict mode expectations

### Safety Considerations  
- Review generated code before execution, especially for complex operations
- Test AI-generated components thoroughly before integration
- Verify that lifecycle hooks are properly implemented
- Ensure proper cleanup in unbinding() methods

### Learning Integration
- Use Warp's explanations to understand Aurelia patterns
- Ask for clarification on generated code you don't understand
- Request examples of best practices for specific scenarios
- Leverage AI to explore advanced Aurelia concepts

## Troubleshooting Common Issues

### Agent Mode Not Understanding Aurelia Patterns
**Solution**: Update system prompts with more specific Aurelia examples and current syntax patterns.

### Build Failures After Code Generation
**Solution**: Ensure prompts emphasize build requirements and include proper import statements.

### Generated Code Using Outdated Patterns
**Solution**: Explicitly specify "Aurelia 2.x" and include examples of modern syntax in your system prompts.

Warp Terminal's AI features, when properly configured with Aurelia-specific context, can significantly accelerate development workflows while maintaining code quality and framework conventions.