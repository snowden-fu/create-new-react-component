# create-new-react-component

A command-line interface (CLI) tool to quickly generate React components with optional TypeScript support and CSS styles.

## Installation

Install globally:
```bash
npm install -g create-new-react-component
```

Or install as dev dependency:
```bash
npm install create-new-react-component --save-dev
```

## Usage
```bash 
create-new-react-component
```

The tool will guide you through an interactive process to create your component with the following options:

1. Component Name (must be in PascalCase)
2. Component Type (Functional, Arrow Function, Class, Memoized, or ForwardRef)
3. Language (JavaScript or TypeScript)
4. Styling Solution (CSS, SCSS, or None)
5. Props Support (Yes/No)
6. React Import Statement (Yes/No)

You can also generate a component non-interactively:

```bash
create-new-react-component Button --type arrow --lang ts --style scss --with-props
```

Available flags:

- `--type <type>`: `functional`, `arrow`, `class`, `memoized`, or `forwardRef`
- `--lang <lang>`: `js` or `ts`
- `--style <style>`: `css`, `scss`, or `none`
- `--with-props`: include a props parameter and TypeScript `Props` interface
- `--with-react-import`: include a React import statement

## Component Type Templates

The tool now supports multiple component type templates:

### Functional Component
```jsx
import styles from './MyComponent.module.css';

function MyComponent(props) {
    return (
        <div className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
}
```

### Arrow Function Component
```jsx
import styles from './MyComponent.module.css';

const MyComponent = (props) => {
    return (
        <div className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
}
```

### Class Component
```jsx
import React from 'react';
import styles from './MyComponent.module.css';

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={styles.root}>
                {/* Add your component content here */}
            </div>
        );
    }
}
```

### Memoized Component (React.memo)
```jsx
import { memo } from 'react';
import styles from './MyComponent.module.css';

const MyComponent = memo((props) => {
    return (
        <div className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
});
```

### ForwardRef Component (React.forwardRef)
```jsx
import { forwardRef } from 'react';
import styles from './MyComponent.module.css';

const MyComponent = forwardRef((props, ref) => {
    return (
        <div ref={ref} className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
});
```

## Help Command
For more information, run the following command:
```bash
create-new-react-component --help
```
or
```bash
create-new-react-component -h
```
to see the help message.

## Examples
```bash
# Start the interactive component creation process
create-new-react-component
```

## References

- [A simple, customizable utility for adding new React components to your project.](https://www.npmjs.com/package/new-component)
- [Delightful React File/Directory Structure](https://www.joshwcomeau.com/react/file-structure/#introduction)

## 🗺️ Roadmap

Here are the planned features and improvements:

### Coming Soon 🚀
- [ ] Extended Component Template Options
- [ ] Enhanced Styling Support
- [ ] More non-interactive CLI options

### Under Consideration 🤔
- [ ] Storybook Integration
- [ ] Automated Test File Generation
- [x] CLI Interaction Improvements

### Completed ✅
- [x] Basic Component Generation
- [x] CSS Module Support
- [x] Component Type Templates (Functional, Arrow, Class, Memoized, ForwardRef)
- [x] Non-interactive CLI generation
- [x] Automated NPM Publishing via GitHub Actions

For detailed development plans, please check our [GitHub Projects](https://github.com/users/snowden-fu/projects/10) page.
