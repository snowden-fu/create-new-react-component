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

- --style <suffix>: Create a style sheet file for the component, if no suffix is provided, the default is css
- --lang <language>: Choose the file style (js or ts), if no language is provided, the default is js

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
# Create a JavaScript component with default options
create-new-react-component MyComponent

# Create a JavaScript component with scss styles
create-new-react-component MyComponent --style scss

# Create a TypeScript component with other default options
create-new-react-component MyComponent --lang ts

# Create a TypeScript component with scss styles
create-new-react-component MyComponent --style scss --lang ts
```


## References

- [A simple, customizable utility for adding new React components to your project.](https://www.npmjs.com/package/new-component)
- [Delightful React File/Directory Structure](https://www.joshwcomeau.com/react/file-structure/#introduction)

## 🗺️ Roadmap

Here are the planned features and improvements:

### Coming Soon 🚀
- [ ] TypeScript Support
- [ ] Extended Component Template Options
- [ ] Enhanced Styling Support

### Under Consideration 🤔
- [ ] Storybook Integration
- [ ] Automated Test File Generation
- [ ] CLI Interaction Improvements

### Completed ✅
- [x] Basic Component Generation
- [x] CSS Module Support

For detailed development plans, please check our [GitHub Projects](link-to-your-project) page.