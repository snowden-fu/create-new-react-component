#!/usr/bin/env node

const commander = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const validateComponentName = require("./ValidateComponentName");

const program = new commander.Command();

program
  .name("create-new-react-component")
  .usage("[options]")
  .version("1.5.0")
  .description(
    "Create a new React component with an optional CSS file. " +
    "The component will be created in a new directory with the same name as the component."
  )
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'componentName',
          message: 'What is the name of your component?',
          validate: (input) => {
            const validation = validateComponentName(input);
            if (!validation.isValid) {
              return validation.error;
            }
            
            // Check if component directory already exists
            const componentDir = path.join(process.cwd(), input.trim());
            if (fs.existsSync(componentDir)) {
              return `Component directory "${input.trim()}" already exists in the current directory`;
            }
            
            return true;
          }
        },
        {
          type: 'list',
          name: 'componentType',
          message: 'What type of component would you like to create?',
          choices: [
            { name: 'Functional Component', value: 'functional' },
            { name: 'Arrow Function Component', value: 'arrow' },
            { name: 'Class Component', value: 'class' },
            { name: 'Memoized Component (React.memo)', value: 'memoized' },
            { name: 'ForwardRef Component (React.forwardRef)', value: 'forwardRef' }
          ],
          default: 'functional'
        },
        {
          type: 'list',
          name: 'lang',
          message: 'What language would you like to use?',
          choices: ['js', 'ts'],
          default: 'js'
        },
        {
          type: 'list',
          name: 'style',
          message: 'What styling solution would you like to use?',
          choices: [
            { name: 'CSS', value: 'css' },
            { name: 'SCSS', value: 'scss' },
            { name: 'None', value: null }
          ],
          default: 'css'
        },
        {
          type: 'confirm',
          name: 'withProps',
          message: 'Would you like to include props in your component?',
          default: false
        },
        {
          type: 'confirm',
          name: 'withImportReact',
          message: 'Would you like to include React import statement?',
          default: false
        }
      ]);

      createComponent(answers.componentName, {
        componentType: answers.componentType,
        lang: answers.lang,
        style: answers.style,
        withProps: answers.withProps,
        withImportReact: answers.withImportReact
      });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

function createComponent(componentName, options) {
  if (!componentName) {
    console.error("Error: <componentName> is required.");
    process.exit(1); // Exit the process with an error code
  }
  const validation = validateComponentName(componentName);
  if (!validation.isValid) {
    console.error(`Error: ${validation.error}`);
    process.exit(1);
  }
  const componentDir = path.join(process.cwd(), componentName);
  const indexFilePath = path.join(componentDir, `index.${options.lang}`);
  const componentFilePath = path.join(
    componentDir,
    `${componentName}.${options.lang === "ts" ? "tsx" : "jsx"}`
  );
  const stylesFilePath = path.join(
    componentDir,
    `${componentName}.module${options.style ? `.${options.style}` : ''}`
  );

  const indexFileContent = `export { default } from './${componentName}';`;

  const ComponentFileContent = require("./ComponentFileContent");
  
  const componentFileContent = new ComponentFileContent(
    componentName,
    options.style ? `.${options.style}` : null,
    options.lang,
    options.withProps,
    options.withImportReact,
    options.componentType
  );
  const componentFileContentContent =
    componentFileContent.generateComponentContent();

  const stylesFileContent = `/* Add your component styles here */
.${componentName} {
}
`;

  if (fs.existsSync(componentDir)) {
    console.error(`Component ${componentName} already exists`);
    return;
  }

  try {
    fs.mkdirSync(componentDir);
    fs.writeFileSync(indexFilePath, indexFileContent);
    fs.writeFileSync(componentFilePath, componentFileContentContent);
    if (options.style) {
      fs.writeFileSync(stylesFilePath, stylesFileContent);
    }
    console.log(
      `Component ${componentName} created successfully as ${options.componentType} component${
        options.style ? " with styles" : ""
      } (${options.lang})`
    );
  } catch (err) {
    console.error(`Error creating component ${componentName}:`, err);
  }
}

program.parse(process.argv);
