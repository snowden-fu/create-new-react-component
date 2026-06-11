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

## v1.9.0 - Storybook and Template Setup

### Storybook Generation

- Add a `--with-story` option.
- Generate `Component.stories.jsx` for JavaScript components.
- Generate `Component.stories.tsx` for TypeScript components.
- Support both built-in and custom component templates.
- Allow `.cnrc.json` to set `"withStory": true`.

Example:

```bash
create-new-react-component Button --with-story
```

### Project Initialization

- Add an `init` command.
- Create a local configuration and template directory:

```text
.cnrc/
├── config.json
└── templates/
```

- Do not overwrite existing configuration or templates.
- Keep `.cnrc.json`, `--template`, and `--template-dir` backward compatible.
- Document the purpose and precedence of `.cnrc.json` and `.cnrc/config.json`.

Example:

```bash
create-new-react-component init
```

### Acceptance Criteria

- Story files are generated correctly for JavaScript and TypeScript.
- Story generation works during batch creation and with `--format`.
- Invalid Storybook or init options fail before component files are written.
- `init` is safe to run in an existing project.
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
