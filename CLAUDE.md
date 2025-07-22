# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a CLI tool for generating React components with various template options. The tool creates a new directory with the component name containing an index file, component file, and optional style file.

## Commands

### Development
- `npm test` - Run Jest tests
- `npm run create-new-react-component` - Run the CLI tool locally
- `node index.js` - Direct execution of the CLI

### Testing
- Run all tests: `npm test`
- Tests are located in the `/test` directory and cover component validation, file naming, and template generation

## Architecture

### Core Files
- `index.js` - Main CLI entry point using Commander.js and Inquirer.js for interactive prompts
- `ComponentFileContent.js` - Class responsible for generating component file content based on template type
- `ValidateComponentName.js` - Validates component names follow PascalCase convention

### Component Generation Flow
1. CLI prompts user for component options (name, type, language, styling, props, React import)
2. `ValidateComponentName` ensures PascalCase naming
3. `ComponentFileContent` class generates appropriate template content
4. Files are created in a new directory: `index.js/ts`, `ComponentName.jsx/tsx`, and optional style file

### Supported Component Types
- Functional components
- Arrow function components  
- Class components
- Memoized components (React.memo)
- ForwardRef components (React.forwardRef)

### Language Support
- JavaScript (.jsx files)
- TypeScript (.tsx files with interface Props)

### Styling Options
- CSS modules (.module.css)
- SCSS modules (.module.scss)
- No styling

## File Structure
Generated components follow this pattern:
```
ComponentName/
├── index.js|ts           // Export statement
├── ComponentName.jsx|tsx // Component implementation
└── ComponentName.module.css|scss // Optional styles
```

## Development Notes

### Testing Strategy
Tests validate:
- Component name validation (PascalCase)
- Component type template generation
- Style file naming conventions

### Key Dependencies
- `commander` - CLI argument parsing
- `inquirer` - Interactive prompts
- `jest` - Testing framework

### Component Template Generation
The `ComponentFileContent` class uses private methods to generate different component patterns. It handles conditional imports, prop typing, and component structure based on the selected template type.