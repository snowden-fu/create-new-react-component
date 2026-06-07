# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Snapshot

`create-new-react-component` is a Node.js CLI for generating React component folders. It supports interactive prompts and scriptable flags for JavaScript/TypeScript, CSS/SCSS modules, component template variants, custom templates, project defaults from `.cnrc.json`, target directories, and optional generated test files.

Keep changes centered on the CLI behavior and generated output. This package is small, so prefer direct, readable code over broad abstractions.

## Important Commands

- `npm test` - run the Jest test suite.
- `npm test -- --runInBand` - reliable quick verification when debugging or before committing.
- `npm run create-new-react-component` - run the local CLI through the npm script.
- `node index.js` - run the CLI entrypoint directly.
- `node index.js SmokeTestComponent --lang ts --style scss --with-test --dir /private/tmp/cnrc-smoke` - useful end-to-end generation smoke test pattern.

## Core Files

- `index.js` - CLI entrypoint, Commander options, Inquirer prompts, config loading, custom template handling, file generation, and exports used by tests.
- `ComponentFileContent.js` - built-in component template generation.
- `ValidateComponentName.js` - PascalCase component name validation.
- `test/` - Jest coverage for validation, component templates, style naming, custom templates, config, and generated test behavior.
- `README.md` and `README.zh-CN.md` - user-facing docs. Update both when behavior or options change.
- `CHANGELOG.md` - update when shipping user-visible behavior.

## Current CLI Behavior To Preserve

- Component names must be PascalCase.
- Non-interactive defaults are `functional`, `js`, and `css`.
- Config precedence is `CLI flags > .cnrc.json > built-in defaults`.
- `.cnrc.json` supports only the documented fields: `lang`, `style`, `componentType`, `withProps`, `withReactImport`, `withTest`, and `baseDir`.
- `--dir` creates the component folder under the target directory and creates parent directories when needed.
- `--style none` should not create or import a style file.
- Class components always include a React import.
- `--with-test` creates a sibling `Component.test.jsx` or `Component.test.tsx`.
- Custom templates are file-based and must continue to pass template safety validation.

## Development Guidelines

- Follow the existing CommonJS style and keep dependencies minimal.
- Keep generated file names and output structure stable unless the task explicitly changes them.
- Add tests close to the behavior being changed. Existing tests import functions from `index.js`, so keep exports stable.
- Use structured path handling through Node's `path` APIs instead of manual path string assembly.
- Avoid changing package metadata, README badges, or roadmap wording unless the task calls for it.
- Be careful with user work in the tree. Check `git status --short --branch` before edits and do not revert unrelated changes.

## Verification Expectations

For documentation-only changes, no test run is usually required.

For CLI behavior or generated output changes:

1. Run `npm test -- --runInBand`.
2. Run at least one real CLI smoke test into `/private/tmp` or another temporary directory.
3. Inspect the generated files, not just the exit code.
4. Clean up temporary smoke-test output only when it is safe and clearly outside the repo.

When a user asks whether generation was tested, treat that as a request for a real end-to-end CLI smoke test in addition to Jest.

## Roadmap Context

Previously confirmed shipped capabilities include interactive CLI usage, non-interactive flags, TypeScript/JavaScript output, CSS/SCSS/no-style output, target directories, custom templates, `.cnrc.json`, README badges, `npx` docs, and `--with-test`.

The roadmap generated during the update-roadmap work should be treated as an evidence-based starting point, not as a substitute for a fresh audit. The repo advanced during that work, so always re-check source, tests, docs, and workflows before moving any item into a release.

### Shipped Items Not To Re-Plan

- `--dir` target directory support.
- `--template` and `--template-dir` custom template support.
- `npx` usage and README badges.
- Non-interactive CLI flags.
- JavaScript and TypeScript output.
- CSS Modules, SCSS Modules, and no-style output.
- Component type variants.
- `.cnrc.json` project defaults with CLI flags taking precedence.
- `--with-test` sibling component test generation.

### Release Plan From Update Roadmap

Use this split when the user asks for roadmap continuation, then refresh it against the current checkout:

- `v1.7.0`: published, config and package quality. This bucket originally covered `.cnrc.json`, package polish, and CI quality work. Since `.cnrc.json` now appears shipped, verify what remains before keeping this bucket open.
- `v1.8.0`: multi-component generation and formatting. Candidate work includes generating multiple components in one command and optional Prettier integration for generated files.
- `v1.9.0`: Storybook output and template system v2. Candidate work includes Storybook story generation, `init` scaffolding, and a more capable template system.
- Post-`v1.7.0`: promotion and adoption work. Keep marketing, examples, and launch polish after the first release-quality implementation slice.

### Open Candidates To Re-Audit

- Multiple components per command.
- Prettier integration.
- Storybook output.
- `init` scaffolding.
- Broader Node-version CI matrix. Prior evidence showed the publish workflow only targeted Node 18.
