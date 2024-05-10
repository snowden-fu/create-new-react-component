# create-new-react-component

A command-line interface (CLI) tool to quickly generate React components with optional TypeScript support and CSS styles.

## Installation

```bash
npm install create-new-react-component --save-dev
```

## Usage
```bash 
create-new-react-component <componentName> [options]
```

## Options

- --withStyles: Create a CSS file for the component
- --lang <style>: Choose the file style (js or ts), default is js

## Examples
```bash
# Create a JavaScript component without styles
create-new-react-component MyComponent

# Create a JavaScript component with styles
create-new-react-component MyComponent --withStyles

# Create a TypeScript component without styles
create-new-react-component MyComponent --lang ts

# Create a TypeScript component with styles
create-new-react-component MyComponent --withStyles --lang ts
```


## References

- [A simple, customizable utility for adding new React components to your project.](https://www.npmjs.com/package/new-component)
- [Delightful React File/Directory Structure](https://www.joshwcomeau.com/react/file-structure/#introduction)