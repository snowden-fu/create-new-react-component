# create-new-react-component

[![npm version](https://img.shields.io/npm/v/create-new-react-component.svg)](https://www.npmjs.com/package/create-new-react-component)
[![npm downloads](https://img.shields.io/npm/dm/create-new-react-component.svg)](https://www.npmjs.com/package/create-new-react-component)
[![Publish to npm](https://github.com/snowden-fu/create-new-react-component/actions/workflows/publish.yml/badge.svg)](https://github.com/snowden-fu/create-new-react-component/actions/workflows/publish.yml)
[![license](https://img.shields.io/npm/l/create-new-react-component.svg)](https://github.com/snowden-fu/create-new-react-component/blob/main/LICENSE)

[中文文档](./README.zh-CN.md)

Generate React component folders from your terminal in a few seconds.

`create-new-react-component` can run as an interactive prompt or as a scriptable CLI command. It supports JavaScript, TypeScript, CSS Modules, SCSS Modules, props stubs, React imports, and several common component templates.

## Features

- Interactive component creation for quick project work
- Non-interactive flags for scripts, npm commands, and editor integrations
- Project defaults from `.cnrc.json`
- JavaScript and TypeScript output
- CSS Module and SCSS Module file generation
- Target directory generation with `--dir`
- Optional component test file generation with `--with-test`
- Functional, arrow function, class, memoized, and `forwardRef` templates
- PascalCase component name validation
- Optional custom template files

## Installation

Install globally:

```bash
npm install -g create-new-react-component
```

Or install in a project:

```bash
npm install --save-dev create-new-react-component
```

You can also run it with `npx`:

```bash
npx create-new-react-component Button
```

## Quick Start

Start the interactive prompt:

```bash
create-new-react-component
```

Or generate a component directly:

```bash
create-new-react-component Button --type arrow --lang ts --style scss --with-props --with-test
```

This creates:

```text
Button/
├── Button.module.scss
├── Button.test.tsx
├── Button.tsx
└── index.ts
```

Generate into an existing or new target directory:

```bash
create-new-react-component Button --dir src/components
```

This creates:

```text
src/components/Button/
├── Button.module.css
├── Button.jsx
└── index.js
```

## Interactive Mode

Run the command without a component name:

```bash
create-new-react-component
```

The prompt asks for:

1. Component name, such as `Button` or `UserProfile`
2. Component type
3. Language
4. Styling solution
5. Props support
6. React import preference
7. Test file generation

Component names must be PascalCase.

## Non-Interactive Mode

Pass the component name and options in one command:

```bash
create-new-react-component UserCard --type functional --lang js --style css
create-new-react-component Dialog --type forwardRef --lang ts --style scss --with-props
create-new-react-component Badge --type memoized --style none
create-new-react-component Button --dir src/components
create-new-react-component Button --with-test
```

You can also set project defaults in `.cnrc.json`:

```json
{
  "lang": "ts",
  "style": "scss",
  "componentType": "arrow",
  "withProps": true,
  "withTest": true,
  "baseDir": "src/components"
}
```

### Options

| Option | Values | Description |
| --- | --- | --- |
| `-T, --type <type>` | `functional`, `arrow`, `class`, `memoized`, `forwardRef` | Component template to generate |
| `-l, --lang <lang>` | `js`, `ts` | Output language |
| `-s, --style <style>` | `css`, `scss`, `none` | Styling file to generate |
| `-d, --dir <path>` | directory path | Target directory where the component folder should be created |
| `--with-props` | | Adds a props parameter and a TypeScript `Props` interface when using `--lang ts` |
| `--with-react-import` | | Adds `import React from 'react';` where applicable |
| `--with-test` | | Adds a basic `Component.test.jsx` or `Component.test.tsx` file |
| `-t, --template <path>` | file path | Adds a custom template file to the interactive template picker |
| `--template-dir <path>` | directory path | Adds all supported custom templates in a directory to the interactive template picker |
| `-h, --help` | | Shows CLI help |
| `-V, --version` | | Shows the installed version |

Default values in non-interactive mode:

```text
--type functional
--lang js
--style css
```

## Project Config

Add `.cnrc.json` to a project root to set defaults for interactive and direct generation.

Supported fields:

| Field | Values | Description |
| --- | --- | --- |
| `lang` | `js`, `ts` | Default output language |
| `style` | `css`, `scss`, `none` | Default style file behavior |
| `componentType` | `functional`, `arrow`, `class`, `memoized`, `forwardRef` | Default built-in component template |
| `withProps` | `true`, `false` | Default props stub behavior |
| `withReactImport` | `true`, `false` | Default React import behavior |
| `withTest` | `true`, `false` | Default component test file behavior |
| `baseDir` | directory path | Default target directory |

Precedence is:

```text
CLI flags > .cnrc.json > built-in defaults
```

For example, this config makes `create-new-react-component Button` generate `src/components/Button/Button.tsx`, `Button.module.scss`, `Button.test.tsx`, and `index.ts`:

```json
{
  "lang": "ts",
  "style": "scss",
  "componentType": "arrow",
  "withProps": true,
  "withTest": true,
  "baseDir": "src/components"
}
```

CLI flags override config values:

```bash
create-new-react-component Button --lang js --style none --dir lib/ui
```

Class components always include the React import because they extend `React.Component`.

When `--dir` points to a directory that does not exist yet, the CLI creates the parent directories automatically.

## Generated Output

With styles enabled, generated components import the CSS or SCSS Module and apply `styles.root`.

```tsx
import styles from './Button.module.scss';

interface Props {}

const Button = (props: Props) => {
    return (
      <div className={styles.root}>
        {/* Add your component content here */}
      </div>
    );
}

export default Button;
```

The style file starts with:

```scss
/* Add your component styles here */
.root {
}
```

The barrel file exports the component:

```ts
export { default } from './Button';
```

With `--with-test`, the CLI also creates a test file beside the component:

```tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button />);

    expect(screen).toBeDefined();
  });
});
```

## Component Types

### Functional

```jsx
function Button() {
    return (
      <>
        {/* Add your component content here */}
      </>
    );
}

export default Button;
```

### Arrow Function

```jsx
const Button = () => {
    return (
      <>
        {/* Add your component content here */}
      </>
    );
}

export default Button;
```

### Class

```jsx
import React from 'react';

class Button extends React.Component {
    render() {
        return (
            <>
                {/* Add your component content here */}
            </>
        );
    }
}

export default Button;
```

### Memoized

```jsx
import { memo } from 'react';

const Button = memo(() => {
    return (
        <>
            {/* Add your component content here */}
        </>
    );
});

export default Button;
```

### Forward Ref

```tsx
import { forwardRef } from 'react';

const Button = forwardRef<HTMLDivElement>((_props, ref) => {
    return (
        <div ref={ref}>
            {/* Add your component content here */}
        </div>
    );
});

export default Button;
```

## Custom Templates

Use a custom template file:

```bash
create-new-react-component --template ./templates/card.tsx
```

Or use a directory of templates:

```bash
create-new-react-component --template-dir ./templates
```

Supported template extensions:

```text
.js
.jsx
.ts
.tsx
```

Available template variables:

| Variable | Example output for `UserCard` |
| --- | --- |
| `{{componentName}}` | `UserCard` |
| `{{ComponentName}}` | `UserCard` |
| `{{COMPONENT_NAME}}` | `USERCARD` |
| `{{component_name}}` | `usercard` |

Example template:

```tsx
import styles from './{{ComponentName}}.module.css';

interface Props {}

const {{ComponentName}} = (props: Props) => {
  return <div className={styles.root}>{{componentName}}</div>;
};

export default {{ComponentName}};
```

## Validation

Component names must:

- Use PascalCase, such as `Button`, `UserCard`, or `NavigationMenu`
- Be at least 2 characters long
- Avoid filesystem-forbidden characters
- Avoid reserved JavaScript and React names
- Avoid common ambiguous names such as `App`, `Main`, or `Index`

## Development

Clone the repository and install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run the CLI locally:

```bash
npm run create-new-react-component
```

## License

MIT
