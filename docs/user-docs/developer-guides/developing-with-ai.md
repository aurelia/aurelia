# Developing with AI

AI coding assistants are increasingly becoming valuable tools for Aurelia development. Modern AI tools can understand large codebases, generate framework-specific code, and help with complex development tasks. This guide covers practical approaches to integrating AI assistants effectively with Aurelia projects.

## How AI Tools Help with Aurelia Development

AI assistants can significantly enhance your Aurelia development workflow:

- **Component generation**: Creating custom elements, attributes, and value converters that follow Aurelia conventions
- **Service development**: Building properly structured services with dependency injection patterns
- **Template work**: Generating binding expressions and template syntax
- **Testing support**: Creating test setups using `@aurelia/testing` patterns
- **Code explanation**: Understanding complex Aurelia patterns, lifecycle behaviors, and architectural decisions
- **Migration assistance**: Converting between Aurelia versions or from other frameworks
- **Refactoring**: Modernizing code to use current Aurelia best practices

## Understanding AI Tool Capabilities

Modern AI assistants have evolved to handle larger contexts and more complex scenarios:

- **Codebase awareness**: Tools can now understand entire project structures and maintain context across multiple files  
- **Framework expertise**: AI models are trained on extensive Aurelia documentation and code examples
- **Pattern recognition**: They can identify and replicate established architectural patterns in your codebase
- **Context-aware suggestions**: Recommendations adapt based on your project's specific configuration and conventions

## Considerations for Different Experience Levels

### Experienced Developers
AI tools act as powerful accelerators for developers who understand Aurelia fundamentals. You can effectively guide AI suggestions and quickly identify when recommendations need adjustment for your specific use case.

### Growing Developers  
AI assistants can help you learn Aurelia patterns by example, but it's important to understand the generated code rather than simply copying it. Use AI suggestions as learning opportunities to explore framework concepts and best practices.

### Best Practices for All Levels
- Review generated code to ensure it follows your project's conventions
- Test AI-generated components and services thoroughly
- Use AI suggestions as starting points rather than final solutions
- Leverage AI to understand complex code patterns and architectural decisions

## Popular AI Development Tools

The AI coding landscape has shifted significantly toward terminal-based tools in 2025, with 76% of developers now using or planning to use AI coding assistants. Here are the most widely adopted tools:

### Terminal-Based AI Agents

**Warp Terminal 2.0**: Advanced terminal with Agent Mode that can autonomously handle multi-step development workflows, including project setup, dependency management, and code generation.

**Google Gemini CLI**: Open-source terminal AI agent with a massive 1M token context window, offering 1,000 free requests per day and strong codebase analysis capabilities.

**Claude Code**: Interactive CLI from Anthropic, excelling at understanding large codebases and complex logic chains across multiple files, especially effective in monorepos.

**Aider**: Command-line AI coding assistant that's consistently ranked among the top tools for terminal-based development workflows.

### IDE-Integrated Tools

**Cursor IDE**: Currently the most popular AI-powered IDE, offering advanced codebase analysis, multi-file editing, and context-aware suggestions.

**GitHub Copilot**: Real-time code completion and chat functionality integrated into VS Code and other popular editors.

**Windsurf**: Agentic development environment that can handle multi-step development tasks autonomously with advanced context understanding.

## Setting Up AI Tools for Aurelia Projects

Each AI tool benefits from project-specific configuration files that provide context about your Aurelia codebase, coding standards, and architectural decisions.

### Configuration Files

| Tool | Configuration File | Location |
|------|-------------------|----------|
| Claude Code | `CLAUDE.md` | Project root or hierarchical |
| GitHub Copilot | `.github/copilot-instructions.md` | Repository root |
| Cursor AI | `.cursorrules` (legacy) or `.cursor/rules/*.mdc` | Project root or `.cursor/rules/` |
| Windsurf | `.windsurfrules` or `.windsurf/rules/` | Project root or workspace |
| Warp Terminal | System prompts, MCP servers | Warp settings or project-level |
| Gemini CLI | System prompts, MCP servers | CLI configuration |
| Aider | `.aider.conf.yml` | Project root |

## Practical Guidelines for AI-Assisted Development

### Start Small and Specific

Don't ask AI to "build a user management system." Instead:
- "Create a basic custom element that displays a user's name and email"
- "Generate a service that fetches user data with proper error handling"
- "Write tests for this specific component method"

### Always Review and Test

AI-generated code often looks correct but has subtle issues:
- **Run your tests** - AI might generate code that compiles but fails at runtime
- **Check for security issues** - AI may suggest patterns with vulnerabilities
- **Verify Aurelia conventions** - AI might use outdated v1 syntax or miss lifecycle requirements

### Effective Configuration Strategies

Provide AI tools with specific, actionable guidance about your Aurelia project:

```markdown
# Aurelia 2.x TypeScript Project

## Framework Patterns
- Use @customElement decorator with standalone components
- Implement lifecycle hooks: binding, bound, attaching, attached, detaching, unbinding
- Bindable properties should use explicit TypeScript interfaces
- Services use @singleton or @transient decorators

## Development Workflow  
- Run `npm run build` after package changes, before testing
- Tests are in packages/__tests__/ directory
- Use @aurelia/testing package for component testing
- Follow AAA pattern: Arrange, Act, Assert

## Code Standards
- TypeScript strict mode enabled
- Prefer const over let, avoid var
- Use kebab-case for custom element names
- Use PascalCase for class names and interfaces
```

### Optimizing AI Interactions

To get the best results from AI assistants:
- Be specific about Aurelia version (2.x) to avoid outdated patterns
- Provide examples of existing code patterns when possible
- Reference specific requirements like TypeScript strict mode
- Include context about your project's architectural decisions

## Example Configuration Files

This repository includes example configuration files for popular AI tools:

- [CLAUDE.md Example](developing-with-ai/claude-md-example.md) - For Claude Code
- [GitHub Copilot Instructions](developing-with-ai/copilot-instructions-example.md) - For GitHub Copilot  
- [Cursor Rules](developing-with-ai/cursor-rules-example.md) - For Cursor AI
- [Windsurf Rules](developing-with-ai/windsurf-rules-example.md) - For Windsurf
- [Warp Terminal Configuration](developing-with-ai/warp-terminal-example.md) - For Warp Terminal 2.0
- [Gemini CLI Setup](developing-with-ai/gemini-cli-example.md) - For Google Gemini CLI
- [Aider Configuration](developing-with-ai/aider-example.md) - For Aider

## Working Effectively with AI on Aurelia Projects

### When Generating Components

Be specific about what you actually need:

**Instead of**: "Create a user profile component"  
**Try**: "Create a custom element that displays user.name and user.email, with a bindable `user` property of type User, and implement unbinding() to clean up any subscriptions"

### For Testing

AI can help with test structure, but verify the logic:

**Good prompt**: "Generate the test setup for testing this UserService.getUser() method, using @aurelia/testing patterns"

**Then verify**: Does the test actually test the right behavior? Are edge cases covered?

### Debugging Limitations

AI can't effectively debug complex issues like:
- Lifecycle timing problems
- DI container configuration issues  
- Template compilation errors
- Cross-component communication problems

For these, you'll need to understand the underlying Aurelia concepts yourself.

## Common Challenges and Solutions

### Ensuring Modern Aurelia Patterns
**Challenge**: AI might suggest outdated Aurelia v1 syntax  
**Solution**: Explicitly specify "Aurelia 2.x" in prompts and configuration files, and include examples of current decorators and patterns

### Build and Test Integration  
**Challenge**: Generated tests fail due to build requirements  
**Solution**: Configure AI tools to understand that `npm run build` is required before testing, and include build commands in your setup instructions

### Component Integration Issues
**Challenge**: AI-generated components don't integrate properly with existing architecture  
**Solution**: Provide AI with examples of your existing components and specify your DI patterns, lifecycle usage, and binding conventions

## Team Development Guidelines

### Code Review Process
Apply the same review standards to AI-generated code as any other contribution:
- Verify adherence to team coding standards and Aurelia best practices
- Ensure proper testing coverage and error handling
- Check for security implications and performance considerations  
- Confirm maintainability and documentation quality

### Recommended AI Usage Patterns
**Effective applications**:
- Component and service boilerplate generation
- Test structure creation and test case generation
- Documentation and code comments
- Refactoring existing code to modern patterns
- Exploring and understanding complex Aurelia concepts

**Areas requiring careful consideration**:
- Critical business logic implementation
- Security-sensitive operations
- Performance-critical code paths
- Architectural and design decisions

## Integration Best Practices

AI tools work best when integrated thoughtfully into your development workflow:

1. **Start with understanding**: Ensure team members understand Aurelia fundamentals before relying heavily on AI assistance
2. **Iterate and refine**: Use AI suggestions as starting points and refine based on your project's specific needs
3. **Maintain context**: Keep AI tools updated with your evolving project patterns and conventions
4. **Balance assistance with learning**: Use AI to accelerate development while continuing to build framework expertise

The goal is to leverage AI capabilities to enhance productivity while maintaining code quality and team knowledge.