#!/usr/bin/env node

const commander = require("commander");
const fs = require("fs");
const path = require("path");
const validateComponentName = require("./ValidateComponentName");

const program = new commander.Command();

program
  .name("create-new-react-component")
  .usage("<componentName> [options]")
  .version("1.1.0")
  .description(
    "Create a new React component with an optional CSS file. " +
      "The component will be created in a new directory with the same name as the component."
  )
  .arguments("[componentName]", "Name of the component to create")
  .option(
    "--style <suffix>",
    "Create a CSS file with the given suffix, if not given, set as 'css'",
    ".css"
  )
  .option(
    "-l, --lang <lang>",
    "Choose the file style (js or ts), if not given, set as 'js'",
    "js"
  )
  .option("--withProps", "Create a component with props")
  .option(
    "--withImportReact",
    "Create a component with `import React from react`"
  )
  .action((componentName, options) => {
    createComponent(componentName, options);
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
