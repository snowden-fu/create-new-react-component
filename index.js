#!/usr/bin/env node

const commander = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const validateComponentName = require("./ValidateComponentName");

function getAvailableCustomTemplates(templateDir, templateFile) {
  const templates = [];
  
  if (templateFile && fs.existsSync(templateFile)) {
    templates.push({
      name: path.basename(templateFile, path.extname(templateFile)),
      path: templateFile,
      type: 'file'
    });
  }
  
  if (templateDir && fs.existsSync(templateDir)) {
    const files = fs.readdirSync(templateDir);
    files.forEach(file => {
      const filePath = path.join(templateDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx'))) {
        templates.push({
          name: path.basename(file, path.extname(file)),
          path: filePath,
          type: 'file'
        });
      }
    });
  }
  
  return templates;
}

function loadCustomTemplate(templatePath) {
  try {
    const content = fs.readFileSync(templatePath, 'utf8');
    validateTemplate(content, templatePath);
    return {
      content,
      variables: extractTemplateVariables(content)
    };
  } catch (error) {
    throw new Error(`Failed to load template: ${error.message}`);
  }
}

function validateTemplate(content, templatePath) {
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /require\s*\(['"]\s*child_process\s*['"]\)/,
    /require\s*\(['"]\s*fs\s*['"]\)/,
    /process\.exit/,
    /process\.kill/,
    /\.exec\s*\(/,
    /\.spawn\s*\(/
  ];
  
  dangerousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      throw new Error(`Template contains potentially dangerous code: ${templatePath}`);
    }
  });
  
  // Check for valid React component structure
  const hasExportDefault = /export\s+default\s+/.test(content) || /module\.exports\s*=/.test(content);
  const hasComponentName = /\{\{componentName\}\}|\{\{ComponentName\}\}/.test(content);
  
  if (!hasExportDefault) {
    console.warn(`Warning: Template ${templatePath} may not have a proper export statement`);
  }
  
  if (!hasComponentName) {
    console.warn(`Warning: Template ${templatePath} does not use {{componentName}} or {{ComponentName}} variables`);
  }
}

function extractTemplateVariables(content) {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables = new Set();
  let match;
  
  while ((match = variableRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

function replaceTemplateVariables(content, variables) {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

const program = new commander.Command();

program
  .name("create-new-react-component")
  .usage("[options]")
  .version("1.5.0")
  .description(
    "Create a new React component with an optional CSS file. " +
    "The component will be created in a new directory with the same name as the component."
  )
  .option('-t, --template <path>', 'path to custom template file')
  .option('--template-dir <path>', 'path to custom templates directory')
  .action(async (options) => {
    try {
      const customTemplates = getAvailableCustomTemplates(options.templateDir, options.template);
      
      const questions = [
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
        }
      ];

      // Add custom template selection if available
      if (customTemplates.length > 0) {
        questions.push({
          type: 'list',
          name: 'customTemplate',
          message: 'Select a custom template:',
          choices: [
            { name: 'Use built-in templates', value: null },
            ...customTemplates.map(template => ({ 
              name: template.name, 
              value: template 
            }))
          ],
          default: null
        });
      }

      questions.push(
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
          default: 'functional',
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'list',
          name: 'lang',
          message: 'What language would you like to use?',
          choices: ['js', 'ts'],
          default: 'js',
          when: (answers) => !answers.customTemplate
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
          default: 'css',
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'confirm',
          name: 'withProps',
          message: 'Would you like to include props in your component?',
          default: false,
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'confirm',
          name: 'withImportReact',
          message: 'Would you like to include React import statement?',
          default: false,
          when: (answers) => !answers.customTemplate
        }
      );

      const answers = await inquirer.prompt(questions);

      createComponent(answers.componentName, {
        componentType: answers.componentType,
        lang: answers.lang,
        style: answers.style,
        withProps: answers.withProps,
        withImportReact: answers.withImportReact,
        customTemplate: answers.customTemplate
      });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

function createComponent(componentName, options) {
  if (!componentName) {
    console.error("Error: <componentName> is required.");
    process.exit(1);
  }
  const validation = validateComponentName(componentName);
  if (!validation.isValid) {
    console.error(`Error: ${validation.error}`);
    process.exit(1);
  }
  
  const componentDir = path.join(process.cwd(), componentName);
  
  if (fs.existsSync(componentDir)) {
    console.error(`Component ${componentName} already exists`);
    return;
  }

  try {
    fs.mkdirSync(componentDir);
    
    if (options.customTemplate) {
      createComponentFromCustomTemplate(componentName, componentDir, options);
    } else {
      createComponentFromBuiltInTemplate(componentName, componentDir, options);
    }
    
    console.log(
      `Component ${componentName} created successfully${
        options.customTemplate 
          ? ` using custom template "${options.customTemplate.name}"` 
          : ` as ${options.componentType} component${options.style ? " with styles" : ""} (${options.lang})`
      }`
    );
  } catch (err) {
    console.error(`Error creating component ${componentName}:`, err);
  }
}

function createComponentFromCustomTemplate(componentName, componentDir, options) {
  const template = loadCustomTemplate(options.customTemplate.path);
  
  const templateVariables = {
    componentName,
    ComponentName: componentName,
    COMPONENT_NAME: componentName.toUpperCase(),
    component_name: componentName.toLowerCase()
  };
  
  const processedContent = replaceTemplateVariables(template.content, templateVariables);
  
  const extension = options.customTemplate.path.endsWith('.tsx') || options.customTemplate.path.endsWith('.ts') ? 
    (options.customTemplate.path.endsWith('.tsx') ? 'tsx' : 'ts') : 
    (options.customTemplate.path.endsWith('.jsx') ? 'jsx' : 'js');
  
  const componentFilePath = path.join(componentDir, `${componentName}.${extension}`);
  const indexFilePath = path.join(componentDir, `index.${extension.includes('ts') ? 'ts' : 'js'}`);
  
  fs.writeFileSync(componentFilePath, processedContent);
  fs.writeFileSync(indexFilePath, `export { default } from './${componentName}';`);
}

function createComponentFromBuiltInTemplate(componentName, componentDir, options) {
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
  const componentFileContentContent = componentFileContent.generateComponentContent();

  const stylesFileContent = `/* Add your component styles here */
.${componentName} {
}
`;

  fs.writeFileSync(indexFilePath, indexFileContent);
  fs.writeFileSync(componentFilePath, componentFileContentContent);
  if (options.style) {
    fs.writeFileSync(stylesFilePath, stylesFileContent);
  }
}

// Only run CLI when executed directly
if (require.main === module) {
  program.parse(process.argv);
}

// Export functions for testing
module.exports = {
  getAvailableCustomTemplates,
  loadCustomTemplate,
  extractTemplateVariables,
  replaceTemplateVariables,
  validateTemplate
};
