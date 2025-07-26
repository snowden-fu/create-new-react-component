# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-07-22

### Added
- **Comprehensive input validation system** - Enhanced component name validation beyond basic PascalCase
  - JavaScript reserved keywords blocking (43 keywords: class, function, import, etc.)
  - React reserved names blocking (21 names: React, Component, Fragment, etc.)
  - Common problematic names blocking (17 names: Index, Main, App, etc.)
  - File system compatibility checks (forbidden characters, Windows reserved names)
  - Real-time directory existence checking during input
  - Specific, actionable error messages for each validation failure
  - Cross-platform compatible validation (Windows, macOS, Linux)
- **Enhanced test coverage** - 37 comprehensive test cases covering all validation scenarios
- **CLAUDE.md documentation** - Guidance for Claude Code instances working with this repository

### Changed
- **Backward compatibility maintained** - Legacy boolean validation function still supported
- **Improved user experience** - More informative error messages with specific guidance
- **Enhanced CLI interaction** - Better validation feedback during component creation

### Fixed
- **Input validation robustness** - Prevents creation of components with problematic names
- **Cross-platform compatibility** - Consistent behavior across different operating systems

## [1.4.0] - 2024-12-19

### Added
- **Extended Component Template Options** - Phase 1 implementation
- Support for 5 different component types:
  - Functional Component (default)
  - Arrow Function Component
  - Class Component
  - Memoized Component (React.memo)
  - ForwardRef Component (React.forwardRef)
- Automatic import management for React hooks (memo, forwardRef)
- TypeScript support for all component types
- Comprehensive test suite for component type templates
- Example files demonstrating each component type

### Changed
- Enhanced CLI interface with component type selection
- Updated component generation logic to support multiple templates
- Improved ComponentFileContent class with template-specific methods
- Updated documentation with component type examples

### Fixed
- **Style file naming bug**: Fixed double dots in CSS/SCSS file names
  - Previously: `ComponentName.module..css`
  - Now: `ComponentName.module.css`

## [1.3.0] - 2024-05-24

### Added
- Interactive CLI interface using inquirer
- Step-by-step component creation process
- Enhanced user experience with guided prompts
- Support for component name validation during creation
- Improved error handling and user feedback

### Changed
- Simplified command usage (no more required arguments)
- Updated documentation to reflect new interactive interface
- Improved component creation workflow

## [1.2.1] - 2024-05-24

### Added
- Basic component generation
- CSS Module support
- Command-line options for styling and language selection

### Changed
- Initial release with basic functionality 