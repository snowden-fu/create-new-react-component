# create-component

A command-line interface (CLI) tool to quickly generate React components with optional TypeScript support and CSS styles.

## Installation

```bash
npm install -g create-new-react-component
```

## Usage
```bash 
create-component <componentName> [options]
```

## Options

- --withStyles: Create a CSS file for the component
- --style <style>: Choose the file style (js or ts), default is js

## Examples
```bash
# Create a JavaScript component without styles
create-component MyComponent

# Create a JavaScript component with styles
create-component MyComponent --withStyles

# Create a TypeScript component without styles
create-component MyComponent --style ts

# Create a TypeScript component with styles
create-component MyComponent --withStyles --style ts
```