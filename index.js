#!/usr/bin/env node

const commander = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const validateComponentName = require("./ValidateComponentName");
const packageJson = require("./package.json");

const COMPONENT_TYPES = ["functional", "arrow", "class", "memoized", "forwardRef"];
const LANGUAGES = ["js", "ts"];
const STYLES = ["css", "scss", "none"];

function validateChoice(name, value, choices) {
  if (value === undefined || value === null) {
    return;
  }

  if (!choices.includes(value)) {
    throw new Error(`${name} must be one of: ${choices.join(", ")}`);
  }
}

function normalizeStyle(style) {
  if (style === undefined || style === null || style === "none") {
    return null;
  }

  return style;
}

function normalizeTargetDir(dir) {
  if (dir === undefined || dir === null) {
    return process.cwd();
  }

  if (typeof dir !== "string") {
    throw new Error("dir must be a string");
  }

  const trimmedDir = dir.trim();

  if (!trimmedDir) {
    throw new Error("dir cannot be empty or whitespace only");
  }

  return path.resolve(process.cwd(), trimmedDir);
}

function resolveCustomTemplate(templateFile) {
  if (!templateFile) {
    return null;
  }

  const templates = getAvailableCustomTemplates(null, templateFile);

  if (templates.length === 0) {
    throw new Error(`Template file not found: ${templateFile}`);
  }

  return templates[0];
}

function buildComponentOptions(options = {}) {
  const componentType = options.type || "functional";
  const lang = options.lang || "js";
  const style = normalizeStyle(options.style === undefined ? "css" : options.style);
  const customTemplate = resolveCustomTemplate(options.template);

  validateChoice("type", componentType, COMPONENT_TYPES);
  validateChoice("lang", lang, LANGUAGES);
  validateChoice("style", options.style, STYLES);

  return {
    componentType,
    lang,
    style,
    withProps: Boolean(options.withProps),
    withImportReact: Boolean(options.withReactImport) || componentType === "class",
    withTest: Boolean(options.withTest),
    targetDir: normalizeTargetDir(options.dir),
    customTemplate
  };
}

function shouldCreateFromOptions(componentName, options) {
  return Boolean(
    componentName ||
    options.type ||
    options.lang ||
    options.style ||
    options.dir ||
    options.withProps ||
    options.withReactImport ||
    options.withTest
  );
}

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
  .version(packageJson.version)
  .description(
    "Create a new React component with an optional CSS file. " +
    "The component will be created in a new directory with the same name as the component."
  )
  .arguments("[componentName]")
  .option('-T, --type <type>', 'component type: functional, arrow, class, memoized, or forwardRef')
  .option('-l, --lang <lang>', 'component language: js or ts')
  .option('-s, --style <style>', 'styling solution: css, scss, or none')
  .option('-d, --dir <path>', 'target directory where the component folder should be created')
  .option('--with-props', 'include a props parameter and TypeScript Props interface')
  .option('--with-react-import', 'include a React import statement')
  .option('--with-test', 'include a basic component test file')
  .option('-t, --template <path>', 'path to custom template file')
  .option('--template-dir <path>', 'path to custom templates directory')
  .action(async (componentName, options) => {
    try {
      if (shouldCreateFromOptions(componentName, options)) {
        createComponent(componentName, buildComponentOptions(options));
        return;
      }

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
            { name: 'Functional Component', value: COMPONENT_TYPES[0] },
            { name: 'Arrow Function Component', value: COMPONENT_TYPES[1] },
            { name: 'Class Component', value: COMPONENT_TYPES[2] },
            { name: 'Memoized Component (React.memo)', value: COMPONENT_TYPES[3] },
            { name: 'ForwardRef Component (React.forwardRef)', value: COMPONENT_TYPES[4] }
          ],
          default: 'functional',
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'list',
          name: 'lang',
          message: 'What language would you like to use?',
          choices: LANGUAGES,
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
          default: (answers) => answers.componentType === 'class',
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'confirm',
          name: 'withTest',
          message: 'Would you like to include a test file?',
          default: false
        }
      );

      const answers = await inquirer.prompt(questions);

      createComponent(answers.componentName, {
        componentType: answers.componentType,
        lang: answers.lang,
        style: answers.style,
        withProps: answers.withProps,
        withImportReact: answers.withImportReact || answers.componentType === 'class',
        withTest: answers.withTest,
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
  
  const trimmedComponentName = componentName.trim();
  const targetDir = options.targetDir || process.cwd();
  const componentDir = path.join(targetDir, trimmedComponentName);
  
  if (fs.existsSync(componentDir)) {
    console.error(`Component ${trimmedComponentName} already exists in ${targetDir}`);
    return;
  }

  try {
    fs.mkdirSync(componentDir, { recursive: true });
    
    if (options.customTemplate) {
      createComponentFromCustomTemplate(trimmedComponentName, componentDir, options);
    } else {
      createComponentFromBuiltInTemplate(trimmedComponentName, componentDir, options);
    }
    
    console.log(
      `Component ${trimmedComponentName} created successfully${
        options.customTemplate 
          ? ` using custom template "${options.customTemplate.name}"` 
          : ` as ${options.componentType} component${options.style ? " with styles" : ""} (${options.lang})`
      } in ${componentDir}`
    );
    return componentDir;
  } catch (err) {
    console.error(`Error creating component ${trimmedComponentName}:`, err);
    throw err;
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

  if (options.withTest) {
    createTestFile(componentName, componentDir, extension);
  }
}

function getTestFileContent(componentName) {
  return `import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);

    expect(screen).toBeDefined();
  });
});
`;
}

function createTestFile(componentName, componentDir, componentExtension) {
  const testExtension = componentExtension.includes('ts') ? 'tsx' : 'jsx';
  const testFilePath = path.join(componentDir, `${componentName}.test.${testExtension}`);

  fs.writeFileSync(testFilePath, getTestFileContent(componentName));
}

function createComponentFromBuiltInTemplate(componentName, componentDir, options) {
  const componentExtension = options.lang === "ts" ? "tsx" : "jsx";
  const indexFilePath = path.join(componentDir, `index.${options.lang}`);
  const componentFilePath = path.join(
    componentDir,
    `${componentName}.${componentExtension}`
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
.root {
}
`;

  fs.writeFileSync(indexFilePath, indexFileContent);
  fs.writeFileSync(componentFilePath, componentFileContentContent);
  if (options.style) {
    fs.writeFileSync(stylesFilePath, stylesFileContent);
  }
  if (options.withTest) {
    createTestFile(componentName, componentDir, componentExtension);
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
  validateTemplate,
  normalizeTargetDir,
  buildComponentOptions,
  getTestFileContent,
  createComponent
};
