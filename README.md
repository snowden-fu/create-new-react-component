# create-new-react-component

Generate React component folders from your terminal in a few seconds.

`create-new-react-component` can run as an interactive prompt or as a scriptable CLI command. It supports JavaScript, TypeScript, CSS Modules, SCSS Modules, props stubs, React imports, and several common component templates.

## Features

- Interactive component creation for quick project work
- Non-interactive flags for scripts, npm commands, and editor integrations
- JavaScript and TypeScript output
- CSS Module and SCSS Module file generation
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
create-new-react-component Button --type arrow --lang ts --style scss --with-props
```

This creates:

```text
Button/
├── Button.module.scss
├── Button.tsx
└── index.ts
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

Component names must be PascalCase.

## Non-Interactive Mode

Pass the component name and options in one command:

```bash
create-new-react-component UserCard --type functional --lang js --style css
create-new-react-component Dialog --type forwardRef --lang ts --style scss --with-props
create-new-react-component Badge --type memoized --style none
```

### Options

| Option | Values | Description |
| --- | --- | --- |
| `-T, --type <type>` | `functional`, `arrow`, `class`, `memoized`, `forwardRef` | Component template to generate |
| `-l, --lang <lang>` | `js`, `ts` | Output language |
| `-s, --style <style>` | `css`, `scss`, `none` | Styling file to generate |
| `--with-props` | | Adds a props parameter and a TypeScript `Props` interface when using `--lang ts` |
| `--with-react-import` | | Adds `import React from 'react';` where applicable |
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

Class components always include the React import because they extend `React.Component`.

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
