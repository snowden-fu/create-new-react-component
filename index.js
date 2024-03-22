#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');
const path = require('path');

const program = new commander.Command();

program
  .name('create-new-react-component')
  .usage('<componentName> [options]')
  .version('1.0.0')
  .description(
    "Create a new React component with an optional CSS file. " +
    "The component will be created in a new directory with the same name as the component."
  )
  .arguments('<componentName>', 'Name of the component to create')
  .option('--withStyles', 'Create a CSS file for the component')
  .option('--style <style>', 'Choose the file style (js or ts)', 'js')
  .action(createComponent);

function createComponent(componentName, options) {
  const componentDir = path.join(process.cwd(), componentName);
  const indexFilePath = path.join(componentDir, `index.${options.style}`);
  const componentFilePath = path.join(componentDir, `${componentName}.${options.style}x`);
  const stylesFilePath = path.join(componentDir, `${componentName}.css`);

  const indexFileContent = `export { default } from './${componentName}';`;

  const componentFileContent = `import React from 'react';
${options.withStyles ? `import './${componentName}.css';` : ''}

${options.style === 'ts' ? `interface Props {}` : ''}

function ${componentName}(${options.style === 'ts' ? '{}:Props' : 'props'}) {
  return (
    <>
      {/* Add your component content here */}
    </>
  );
};

export default ${componentName};
`;

  const stylesFileContent = `/* Add your component styles here */
.${componentName} {
}
`;

  try {
    fs.mkdirSync(componentDir);
    fs.writeFileSync(indexFilePath, indexFileContent);
    fs.writeFileSync(componentFilePath, componentFileContent);
    if (options.withStyles) {
      fs.writeFileSync(stylesFilePath, stylesFileContent);
    }
    console.log(`Component ${componentName} created successfully${options.withStyles ? ' with styles' : ''} (${options.style})`);
  } catch (err) {
    console.error(`Error creating component ${componentName}:`, err);
  }
}

program.parse(process.argv);