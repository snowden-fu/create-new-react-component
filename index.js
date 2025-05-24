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
  .version("1.3.0")
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
            if (!input) return 'Component name is required';
            if (!validateComponentName(input)) {
              return 'Component name must be in PascalCase (e.g., MyComponent)';
            }
            return true;
          }
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
        lang: answers.lang,
        style: answers.style ? `.${answers.style}` : null,
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
  if (!validateComponentName(componentName)) {
    console.error(
      "Error: Component name must be in PascalCase (e.g., MyComponent)"
    );
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
    `${componentName}.module.${options.style}`
  );

  const indexFileContent = `export { default } from './${componentName}';`;

  const ComponentFileContent = require("./ComponentFileContent");
  
  const componentFileContent = new ComponentFileContent(
    componentName,
    options.style,
    options.lang,
    options.withProps,
    options.withImportReact
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
      `Component ${componentName} created successfully${
        options.style ? " with language" : ""
      } (${options.lang})`
    );
  } catch (err) {
    console.error(`Error creating component ${componentName}:`, err);
  }
}

program.parse(process.argv);
