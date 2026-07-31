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

### Experimental AI Audit prototype

- OpenAI-powered, user-initiated, read-only component-system analysis
- Evidence-backed findings with impact, effort, risk, and migration guidance
- Concise terminal reports, full terminal detail, and structured JSON output
- Explicit source-sharing, API-cost, and context-size boundaries

## v1.9.0 - Storybook and Template Setup

### Release Goals

- Make Storybook output feel complete enough for real project adoption.
- Give teams a first-run setup path instead of requiring manual config copying.
- Keep the release focused on component scaffolding, not full app generation.
- Preserve scriptable CLI behavior for CI, npm scripts, and editor commands.

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

## AI Product Path

The AI audit will develop as a separate, validation-driven product track. It
does not expand the committed v1.9.0 scope, and it will not receive a fixed
release number until real-project feedback demonstrates that its advice is
consistently trustworthy.

### 1. Prototype - Completed

- Provide an `audit` command that identifies overlapping responsibilities,
  duplicated component APIs, and opportunities for shared primitives.
- Support evidence-backed `merge`, `shared-primitive`, and `keep-separate`
  recommendations instead of relying only on source similarity.
- Keep analysis user-initiated and read-only; do not modify project files.

### 2. Validation

- Test the audit against at least five varied React projects.
- Review the top three findings from each run for correctness, evidence quality,
  prioritization, and actionability.
- Record latency, estimated API cost, false positives, and important missed
  findings.
- Complete validation when most top findings are useful and no recurring
  evidence or prioritization failure remains.

### 3. Beta Hardening

- Improve context selection and monorepo handling.
- Add configurable exclusions and a clearer preview of what will be sent.
- Show token and cost estimates before submission.
- Stabilize JSON output for scripts and CI while preserving model overrides.
- Continue documenting the command as experimental until validation is
  complete.

### 4. Trusted Read-only Advisor

- Accept team-specific component conventions and design-system context.
- Add optional report comparison or baselines for tracking UI debt over time.
- Provide CI-friendly reports without modifying files or failing builds by
  default.
- Keep generated patches, automated refactors, PR bots, hosted dashboards, and
  SaaS collaboration outside the committed product path.

## Future Considerations

### Component Scaffolding

These ideas remain candidates for the core scaffolding workflow:

- User-defined test and Storybook templates
- Additional style strategies beyond CSS and SCSS Modules
- Named template presets
- Config discovery in monorepos
- Dry-run output for scripts and CI

### AI Exploration

Capabilities beyond the read-only advisor, including patch generation,
automatic refactoring, pull-request automation, and hosted team collaboration,
require separate user validation before they enter the committed roadmap.

The project should avoid becoming a full application framework. New features
should directly improve component scaffolding speed, consistency, or project
integration.

## Promotion

After v1.9.0:

- Add a short terminal GIF to the README.
- Publish a 30-second before-and-after demo.
- Write an article about generating TypeScript and SCSS React components.
- Position the package as a focused alternative to larger React generators.

After the AI validation milestone:

- Publish a short audit demo using a representative React project.
- Explain how evidence-backed AI advice differs from mechanical component
  similarity checks.
