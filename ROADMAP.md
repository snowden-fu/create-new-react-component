# Roadmap

`create-new-react-component` aims to remain a small, fast React component
scaffolder for teams that want consistent component folders without managing
boilerplate by hand.

## Current Status

### Completed in v1.7.0

- Project defaults from `.cnrc.json`
- Target directory generation with `--dir`
- Optional test generation with `--with-test`
- npm package file allowlist
- CI coverage for Node.js 18, 20, 22, and 24

### Completed in v1.8.0

- Multiple component names in one command
- All-or-nothing batch validation and rollback
- Optional project-aware Prettier formatting with `--format`
- Formatting support for built-in and custom-template output

### Completed toward v1.9.0

- Optional Storybook story generation with `--with-story`
- JavaScript and TypeScript story files beside generated components
- `.cnrc.json` default support with `"withStory": true`
- Story generation for built-in and custom-template output
- Formatting support for generated story files
- Safe `init` command for `.cnrc/config.json` and starter templates
- Backward-compatible layered config loading for `.cnrc/config.json` and `.cnrc.json`
- Editable JavaScript and TypeScript starter component templates

## v1.9.0 - Storybook and Template Setup

### Release Goals

- Make Storybook output feel complete enough for real project adoption.
- Give teams a first-run setup path instead of requiring manual config copying.
- Keep the release focused on component scaffolding, not full app generation.
- Preserve scriptable CLI behavior for CI, npm scripts, and editor commands.

### Project Initialization - Implemented

- Added an `init` command.
- Creates a local configuration and template directory:

```text
.cnrc/
├── config.json
└── templates/
```

- Does not overwrite existing configuration or templates.
- Keeps `.cnrc.json`, `--template`, and `--template-dir` backward compatible.
- Documents the purpose and precedence of `.cnrc.json` and `.cnrc/config.json`.

Example:

```bash
create-new-react-component init
```

### Template Setup

- Add starter templates that demonstrate the supported template variables.
- Include JavaScript and TypeScript examples for common component shapes.
- Keep custom templates file-based and backward compatible with `--template` and
  `--template-dir`.
- Document how team-owned templates should be committed to a project.

### Documentation and Examples

- Add a v1.9.0 quick-start path for Storybook-enabled projects.
- Add example commands for generating one component and multiple components with
  stories, tests, styles, and formatting.
- Add a small comparison section that explains when to use this CLI instead of a
  larger generator.
- Update npm and README messaging around predictable component folders for
  teams.

### Acceptance Criteria

- Invalid Storybook or init options fail before component files are written.
- `init` is safe to run in an existing project.
- Generated Storybook files are covered by tests for JavaScript, TypeScript, and
  no-style output.
- Starter templates are documented and covered by at least one generation test.
- English and Chinese documentation cover all new options.
- Existing tests and supported Node.js versions continue to pass.

## Future Considerations

These ideas should be evaluated using user feedback rather than committed to a
specific release:

- User-defined test and Storybook templates
- Additional style strategies beyond CSS and SCSS Modules
- Named template presets
- Config discovery in monorepos
- Dry-run output for scripts and CI

The project should avoid becoming a full application framework. New features
should directly improve component scaffolding speed, consistency, or project
integration.

## Promotion

After v1.9.0:

- Add a short terminal GIF to the README.
- Publish a 30-second before-and-after demo.
- Write an article about generating TypeScript and SCSS React components.
- Position the package as a focused alternative to larger React generators.
