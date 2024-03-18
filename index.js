#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');
const path = require('path');

const program = new commander.Command();

program
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

${options.style === 'ts' ? `interface ${componentName}Props {}` : ''}

const ${componentName}${options.style === 'ts' ? `: React.FC<${componentName}Props>` : ''} = (props) => {
  return (
    <div className="${componentName}">
      {/* Add your component content here */}
    </div>
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