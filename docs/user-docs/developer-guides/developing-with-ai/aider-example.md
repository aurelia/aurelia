# Aider Configuration Example for Aurelia Projects

This document shows how to configure Aider, a command-line AI coding assistant, for effective Aurelia development with proper git integration and codebase understanding.

## Aider Overview

Aider is a command-line AI coding assistant that excels at:
- **Git integration**: Automatically commits changes with descriptive messages
- **Codebase awareness**: Understands project structure and file relationships
- **Incremental development**: Makes focused changes while preserving existing code
- **Multiple file editing**: Can coordinate changes across multiple files
- **Model flexibility**: Supports various AI models (Claude, GPT-4, etc.)

## Installation and Setup

### Installation

```bash
# Install Aider
pip install aider-chat

# Or use pipx for isolated installation
pipx install aider-chat

# Verify installation
aider --version
```

### Initial Configuration

```bash
# Set up API keys (choose your preferred model)
export ANTHROPIC_API_KEY=your_key_here  # For Claude
export OPENAI_API_KEY=your_key_here     # For GPT-4

# Initialize in your Aurelia project
cd your-aurelia-project
aider --help
```

## Project Configuration: .aider.conf.yml

Create a configuration file in your project root:

```yaml
# .aider.conf.yml - Aurelia project configuration

# Model selection (recommended for Aurelia development)
model: claude-3-5-sonnet-20241022

# Git configuration
auto-commits: true
commit-prompt: |
  Please provide a concise commit message that:
  - Starts with a conventional commit type (feat:, fix:, refactor:, test:, docs:)
  - Describes the Aurelia-specific changes made
  - Mentions component/service names when relevant
  
# File patterns to include automatically
include:
  - "src/**/*.ts"
  - "src/**/*.html"
  - "packages/**/*.ts"
  - "packages/__tests__/**/*.ts"
  - "package.json"
  - "tsconfig.json"

# File patterns to exclude
exclude:
  - "node_modules/**"
  - "dist/**"
  - "*.log"
  - ".git/**"
  - "coverage/**"

# Aurelia-specific instructions
system-prompt: |
  You are an expert Aurelia 2.x developer. When working with this codebase:

  ## Framework Context
  - This is an Aurelia 2.x TypeScript application
  - Use modern @customElement decorator syntax, not v1 registration
  - Components follow MVVM with clear view/view-model separation
  - Dependency injection via @aurelia/kernel with @singleton/@transient
  - Lifecycle: creating → created → binding → bound → attaching → attached → detaching → unbinding

  ## Critical Build Requirements
  - Always run `npm run build` after changes to packages/ directory
  - Build is required before running tests in packages/__tests__/
  - Use `npm run dev -- -t "pattern"` for targeted testing
  - Tests must use @aurelia/testing package

  ## Code Standards
  - TypeScript strict mode - never use `any` type
  - Custom elements use kebab-case names, classes use PascalCase
  - Always implement proper cleanup in unbinding() lifecycle hook
  - Bindable properties need explicit TypeScript interfaces
  - Services use @singleton for stateless, @transient for stateful
  - Prefer const over let, never use var

  ## When making changes:
  1. Preserve existing patterns and architecture
  2. Follow established naming conventions
  3. Ensure proper lifecycle hook implementation
  4. Add/update tests as needed
  5. Maintain TypeScript type safety

# Default files to add to chat
default-files:
  - "src/"
  - "package.json"

# Testing integration
test-cmd: "npm run build && npm run test"

# Linting integration  
lint-cmd: "npm run lint"
```

## Usage Patterns for Aurelia Development

### Component Development

```bash
# Create a new Aurelia component with proper structure
aider --message "Create a user-avatar custom element that:
- Takes a bindable user property with User interface
- Shows user.name and user.avatar image
- Has a size property (small, medium, large) 
- Implements proper lifecycle hooks for cleanup
- Includes comprehensive tests using @aurelia/testing"

# Add the component files to the conversation
aider src/components/user-avatar.ts src/components/user-avatar.html
```

### Service Development

```bash
# Generate a service with proper DI patterns
aider --message "Create a NotificationService that:
- Uses @singleton decorator
- Has methods: show(message, type), dismiss(id), clear()
- Manages notification state with proper cleanup
- Integrates with existing EventAggregator
- Includes error handling and logging
- Has complete unit tests"

# Include related files for context
aider src/services/ src/interfaces/
```

### Refactoring and Modernization

```bash
# Modernize existing components
aider --message "Refactor the UserProfile component to:
- Use modern Aurelia 2.x patterns
- Replace any remaining v1 syntax
- Add proper TypeScript types for all properties
- Implement missing lifecycle hooks
- Update tests to use latest @aurelia/testing patterns"

# Include the component and its tests
aider src/components/user-profile.ts packages/__tests__/src/user-profile.spec.ts
```

### Bug Fixes and Debugging

```bash
# Fix complex issues with full context
aider --message "The shopping cart component isn't updating when items are added. 
Debug and fix the reactivity issue. The problem seems to be in the binding between 
CartService and CartComponent."

# Add relevant files to provide context
aider src/components/shopping-cart.ts src/services/cart-service.ts src/interfaces/cart.ts
```

## Advanced Configuration Options

### Model-Specific Settings

```yaml
# Claude-specific configuration for better Aurelia understanding
model-settings:
  claude-3-5-sonnet-20241022:
    temperature: 0.1
    max-tokens: 4096
    system-prompt-append: |
      Focus on TypeScript type safety and Aurelia lifecycle correctness.
      Always validate that components properly implement cleanup in unbinding().

# GPT-4 alternative configuration  
  gpt-4:
    temperature: 0.2
    max-tokens: 4096
    system-prompt-append: |
      Prioritize Aurelia 2.x patterns over v1 syntax.
      Ensure all generated code follows the project's TypeScript strict mode.
```

### Git Integration Settings

```yaml
# Enhanced git configuration
git:
  auto-commits: true
  commit-prompt: |
    Generate a commit message using conventional commits format:
    
    Types: feat, fix, docs, style, refactor, test, chore
    Scope: component name, service name, or area (e.g., auth, cart, ui)
    
    Examples:
    - feat(cart): add remove item functionality
    - fix(user-profile): resolve binding update issue  
    - refactor(services): modernize DI patterns
    - test(components): add missing lifecycle tests

  # Don't commit certain file types
  ignore-files:
    - "*.log"
    - "dist/"
    - "node_modules/"
    - ".env*"
```

### Testing Integration

```yaml
# Test automation
test-integration:
  pre-commit-tests: true
  test-command: "npm run build && npm run test"
  lint-command: "npm run lint && npm run typecheck"
  
  # Run tests automatically after changes
  auto-test-patterns:
    - "src/components/**/*.ts"
    - "src/services/**/*.ts"
    - "packages/__tests__/**/*.ts"
```

## Workflow Examples

### New Feature Development

```bash
# Start a new feature with proper git branch
git checkout -b feature/user-preferences

# Use Aider to develop the feature
aider --message "Implement user preferences system:
1. Create UserPreferences interface
2. Create PreferencesService with save/load methods
3. Create preferences-panel custom element
4. Add proper error handling and validation
5. Write comprehensive tests
6. Update existing components to use preferences"

# Aider will create multiple files and commit them appropriately
```

### Code Review Preparation

```bash
# Before creating a PR, use Aider to review changes
aider --message "Review the changes in this branch for:
- Aurelia best practices compliance
- TypeScript type safety
- Test coverage completeness
- Performance implications
- Accessibility considerations
Make any necessary improvements."
```

### Legacy Code Modernization

```bash
# Modernize old Aurelia v1 code
aider src/legacy/ --message "Modernize these legacy components to Aurelia 2.x:
- Update decorator syntax
- Add proper TypeScript types
- Implement missing lifecycle hooks
- Update binding expressions
- Modernize DI patterns
- Update tests to use @aurelia/testing"
```

## Integration with Development Tools

### IDE Integration

```bash
# Create a shell script for easy IDE integration
#!/bin/bash
# scripts/aider-component.sh
aider --message "Create Aurelia component: $1" src/components/
```

### Package.json Scripts

```json
{
  "scripts": {
    "ai:component": "aider --message 'Create new Aurelia component' src/components/",
    "ai:service": "aider --message 'Create new Aurelia service' src/services/",
    "ai:fix": "aider --message 'Fix issues in current files'",
    "ai:test": "aider --message 'Add missing tests' packages/__tests__/",
    "ai:refactor": "aider --message 'Refactor and modernize code'"
  }
}
```

### Pre-commit Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Run Aider for final code review before commit

if command -v aider &> /dev/null; then
    echo "Running AI code review..."
    aider --no-auto-commits --message "Review staged changes for:
    - Code quality issues
    - Aurelia convention compliance  
    - Missing error handling
    - Test coverage gaps
    Fix any issues found."
fi
```

## Best Practices

### Effective Prompting

- **Be specific**: "Create a UserService with CRUD operations" vs "Create a service"
- **Include context**: Reference existing patterns and interfaces in your project
- **Specify requirements**: Mention testing, error handling, TypeScript types
- **Set boundaries**: Define what should/shouldn't be changed

### File Management

- Start conversations with relevant files already added
- Use `aider --include` patterns to automatically include related files
- Exclude large generated files that don't need AI modification
- Keep conversations focused on related changes

### Git Workflow

- Use descriptive commit messages that Aider generates
- Review changes before they're committed (use `--no-auto-commits` for manual control)
- Create feature branches for larger changes
- Use conventional commit format for better project history

### Quality Assurance

- Always run tests after Aider makes changes: `npm run build && npm run test`
- Use linting integration to catch style issues early
- Review generated TypeScript types for correctness
- Verify that lifecycle hooks are properly implemented

## Troubleshooting

### Common Issues

**Aider suggests outdated Aurelia patterns**
- Update your system prompt with more specific v2 examples
- Include recent Aurelia components as context files

**Generated code doesn't build**
- Ensure build requirements are clear in system prompt
- Add TypeScript configuration files to context

**Tests fail after changes**
- Include existing test files in conversations
- Specify `@aurelia/testing` requirements in system prompt

**Git commits are too generic**
- Customize the commit-prompt with project-specific guidelines
- Review and edit commit messages before pushing

Aider's git integration and incremental development approach make it particularly well-suited for maintaining and evolving Aurelia applications while preserving code quality and project conventions.