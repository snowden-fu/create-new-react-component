#!/usr/bin/env node

const commander = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const validateComponentName = require("./ValidateComponentName");
const packageJson = require("./package.json");

const COMPONENT_TYPES = ["functional", "arrow", "class", "memoized", "forwardRef"];
const LANGUAGES = ["js", "ts"];
const STYLES = ["css", "scss", "none"];
const CONFIG_FILE_NAME = ".cnrc.json";
const CNRC_DIRECTORY_NAME = ".cnrc";
const CNRC_CONFIG_FILE_NAME = "config.json";
const CONFIG_FIELDS = [
  "lang",
  "style",
  "componentType",
  "withProps",
  "withReactImport",
  "withTest",
  "withStory",
  "format",
  "baseDir"
];

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

function validateBoolean(name, value) {
  if (value !== undefined && typeof value !== "boolean") {
    throw new Error(`${name} must be a boolean`);
  }
}

function readProjectConfig(configPath, displayName) {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  let config;

  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read ${displayName}: ${error.message}`);
  }

  if (!config || Array.isArray(config) || typeof config !== "object") {
    throw new Error(`${displayName} must contain a JSON object`);
  }

  Object.keys(config).forEach((field) => {
    if (!CONFIG_FIELDS.includes(field)) {
      throw new Error(`${displayName} contains unsupported field: ${field}`);
    }
  });

  validateChoice("lang", config.lang, LANGUAGES);
  validateChoice("style", config.style, STYLES);
  validateChoice("componentType", config.componentType, COMPONENT_TYPES);
  validateBoolean("withProps", config.withProps);
  validateBoolean("withReactImport", config.withReactImport);
  validateBoolean("withTest", config.withTest);
  validateBoolean("withStory", config.withStory);
  validateBoolean("format", config.format);

  if (config.baseDir !== undefined && typeof config.baseDir !== "string") {
    throw new Error("baseDir must be a string");
  }

  return config;
}

function loadProjectConfig(cwd = process.cwd()) {
  const legacyConfig = readProjectConfig(
    path.join(cwd, CONFIG_FILE_NAME),
    CONFIG_FILE_NAME
  );
  const cnrcConfig = readProjectConfig(
    path.join(cwd, CNRC_DIRECTORY_NAME, CNRC_CONFIG_FILE_NAME),
    path.join(CNRC_DIRECTORY_NAME, CNRC_CONFIG_FILE_NAME)
  );

  return { ...legacyConfig, ...cnrcConfig };
}

function getStarterTemplates() {
  return {
    "component.jsx": `const {{ComponentName}} = () => {
  return <div>{{ComponentName}}</div>;
};

export default {{ComponentName}};
`,
    "component.tsx": `interface {{ComponentName}}Props {}

const {{ComponentName}} = (_props: {{ComponentName}}Props) => {
  return <div>{{ComponentName}}</div>;
};

export default {{ComponentName}};
`
  };
}

function initializeProject(cwd = process.cwd()) {
  const cnrcDir = path.join(cwd, CNRC_DIRECTORY_NAME);
  const templatesDir = path.join(cnrcDir, "templates");
  const configPath = path.join(cnrcDir, CNRC_CONFIG_FILE_NAME);
  const created = [];
  const skipped = [];

  fs.mkdirSync(templatesDir, { recursive: true });

  const files = {
    [configPath]: `${JSON.stringify({
      lang: "js",
      style: "css",
      componentType: "functional",
      baseDir: "src/components"
    }, null, 2)}\n`,
    ...Object.fromEntries(
      Object.entries(getStarterTemplates()).map(([fileName, content]) => [
        path.join(templatesDir, fileName),
        content
      ])
    )
  };

  Object.entries(files).forEach(([filePath, content]) => {
    const relativePath = path.relative(cwd, filePath);

    if (fs.existsSync(filePath)) {
      skipped.push(relativePath);
      return;
    }

    fs.writeFileSync(filePath, content, { flag: "wx" });
    created.push(relativePath);
  });

  return { created, skipped };
}

function mergeConfigWithCliOptions(options = {}, config = {}) {
  return {
    type: options.type || config.componentType,
    lang: options.lang || config.lang,
    style: options.style === undefined ? config.style : options.style,
    dir: options.dir || config.baseDir,
    withProps: options.withProps || config.withProps,
    withReactImport: options.withReactImport || config.withReactImport,
    withTest: options.withTest || config.withTest,
    withStory: options.withStory || config.withStory,
    format: options.format || config.format,
    template: options.template,
    templateDir: options.templateDir
  };
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

function buildComponentOptions(options = {}, config = {}) {
  const mergedOptions = mergeConfigWithCliOptions(options, config);
  const componentType = mergedOptions.type || "functional";
  const lang = mergedOptions.lang || "js";
  const style = normalizeStyle(mergedOptions.style === undefined ? "css" : mergedOptions.style);
  const customTemplate = resolveCustomTemplate(options.template);

  validateChoice("type", componentType, COMPONENT_TYPES);
  validateChoice("lang", lang, LANGUAGES);
  validateChoice("style", mergedOptions.style, STYLES);

  return {
    componentType,
    lang,
    style,
    withProps: Boolean(mergedOptions.withProps),
    withImportReact: Boolean(mergedOptions.withReactImport) || componentType === "class",
    withTest: Boolean(mergedOptions.withTest),
    withStory: Boolean(mergedOptions.withStory),
    format: Boolean(mergedOptions.format),
    targetDir: normalizeTargetDir(mergedOptions.dir),
    customTemplate
  };
}

function parseComponentNames(input) {
  const values = Array.isArray(input) ? input : [input];

  return values
    .filter((value) => typeof value === "string")
    .flatMap((value) => value.split(/[\s,]+/))
    .map((value) => value.trim())
    .filter(Boolean);
}

function validateComponentBatch(componentNames, targetDir) {
  if (componentNames.length === 0) {
    throw new Error("At least one component name is required.");
  }

  const seenNames = new Set();

  componentNames.forEach((componentName) => {
    const validation = validateComponentName(componentName);

    if (!validation.isValid) {
      throw new Error(`${componentName}: ${validation.error}`);
    }

    if (seenNames.has(componentName)) {
      throw new Error(`Duplicate component name: ${componentName}`);
    }

    seenNames.add(componentName);

    const componentDir = path.join(targetDir, componentName);
    if (fs.existsSync(componentDir)) {
      throw new Error(`Component ${componentName} already exists in ${targetDir}`);
    }
  });
}

function shouldCreateFromOptions(componentNames, options) {
  return Boolean(
    parseComponentNames(componentNames).length > 0 ||
    options.type ||
    options.lang ||
    options.style ||
    options.dir ||
    options.withProps ||
    options.withReactImport ||
    options.withTest ||
    options.withStory ||
    options.format
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
  .command("init")
  .description("create project configuration and starter templates in .cnrc")
  .action(() => {
    try {
      const result = initializeProject();

      result.created.forEach((filePath) => {
        console.log(`Created ${filePath}`);
      });
      result.skipped.forEach((filePath) => {
        console.log(`Skipped existing ${filePath}`);
      });

      if (result.created.length === 0) {
        console.log("CNRC project setup is already initialized.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      process.exitCode = 1;
    }
  });

program
  .name("create-new-react-component")
  .usage("[componentNames...] [options]")
  .version(packageJson.version)
  .description(
    "Create one or more React components with optional style and test files. " +
    "Each component is created in a directory with the same name."
  )
  .arguments("[componentNames...]")
  .option('-T, --type <type>', 'component type: functional, arrow, class, memoized, or forwardRef')
  .option('-l, --lang <lang>', 'component language: js or ts')
  .option('-s, --style <style>', 'styling solution: css, scss, or none')
  .option('-d, --dir <path>', 'target directory where the component folder should be created')
  .option('--with-props', 'include a props parameter and TypeScript Props interface')
  .option('--with-react-import', 'include a React import statement')
  .option('--with-test', 'include a basic component test file')
  .option('--with-story', 'include a basic Storybook story file')
  .option('--format', 'format generated files with Prettier')
  .option('-t, --template <path>', 'path to custom template file')
  .option('--template-dir <path>', 'path to custom templates directory')
  .action(async (componentNames, options) => {
    try {
      const projectConfig = loadProjectConfig();
      const mergedOptions = mergeConfigWithCliOptions(options, projectConfig);

      if (shouldCreateFromOptions(componentNames, options)) {
        await createComponents(componentNames, buildComponentOptions(options, projectConfig));
        return;
      }

      const customTemplates = getAvailableCustomTemplates(options.templateDir, options.template);
      const promptTargetDir = normalizeTargetDir(mergedOptions.dir);
      
      const questions = [
        {
          type: 'input',
          name: 'componentNames',
          message: 'What are the names of your components?',
          validate: (input) => {
            try {
              validateComponentBatch(parseComponentNames(input), promptTargetDir);
              return true;
            } catch (error) {
              return error.message;
            }
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
          default: mergedOptions.type || 'functional',
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'list',
          name: 'lang',
          message: 'What language would you like to use?',
          choices: LANGUAGES,
          default: mergedOptions.lang || 'js',
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
          default: mergedOptions.style === undefined ? 'css' : normalizeStyle(mergedOptions.style),
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'confirm',
          name: 'withProps',
          message: 'Would you like to include props in your component?',
          default: Boolean(mergedOptions.withProps),
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'confirm',
          name: 'withImportReact',
          message: 'Would you like to include React import statement?',
          default: (answers) => Boolean(mergedOptions.withReactImport) || answers.componentType === 'class',
          when: (answers) => !answers.customTemplate
        },
        {
          type: 'confirm',
          name: 'withTest',
          message: 'Would you like to include a test file?',
          default: Boolean(mergedOptions.withTest)
        },
        {
          type: 'confirm',
          name: 'withStory',
          message: 'Would you like to include a Storybook story file?',
          default: Boolean(mergedOptions.withStory)
        },
        {
          type: 'confirm',
          name: 'format',
          message: 'Would you like to format generated files with Prettier?',
          default: Boolean(mergedOptions.format)
        }
      );

      const answers = await inquirer.prompt(questions);

      await createComponents(answers.componentNames, {
        componentType: answers.componentType,
        lang: answers.lang,
        style: answers.style,
        withProps: answers.withProps,
        withImportReact: answers.withImportReact || answers.componentType === 'class',
        withTest: answers.withTest,
        withStory: answers.withStory,
        format: answers.format,
        targetDir: promptTargetDir,
        customTemplate: answers.customTemplate
      });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

function getFilesRecursively(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getFilesRecursively(entryPath) : [entryPath];
  });
}

async function formatGeneratedFiles(componentDirs) {
  const generatedFiles = componentDirs.flatMap(getFilesRecursively);

  for (const filePath of generatedFiles) {
    const config = await prettier.resolveConfig(filePath, { editorconfig: true });
    const content = fs.readFileSync(filePath, "utf8");
    const formattedContent = prettier.format(content, {
      ...config,
      filepath: filePath
    });

    fs.writeFileSync(filePath, formattedContent);
  }
}

async function createComponents(componentNames, options) {
  const parsedNames = parseComponentNames(componentNames);
  const targetDir = options.targetDir || process.cwd();
  const componentDirs = parsedNames.map((componentName) =>
    path.join(targetDir, componentName)
  );

  validateComponentBatch(parsedNames, targetDir);

  try {
    parsedNames.forEach((componentName) => {
      createComponent(componentName, { ...options, silent: true });
    });

    if (options.format) {
      await formatGeneratedFiles(componentDirs);
    }

    parsedNames.forEach((componentName) => {
      logComponentCreated(
        componentName,
        path.join(targetDir, componentName),
        options
      );
    });

    return componentDirs;
  } catch (error) {
    componentDirs.forEach((componentDir) => {
      if (fs.existsSync(componentDir)) {
        fs.rmSync(componentDir, { recursive: true, force: true });
      }
    });
    throw error;
  }
}

function logComponentCreated(componentName, componentDir, options) {
  console.log(
    `Component ${componentName} created successfully${
      options.customTemplate
        ? ` using custom template "${options.customTemplate.name}"`
        : ` as ${options.componentType} component${options.style ? " with styles" : ""} (${options.lang})`
    } in ${componentDir}`
  );
}

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
    
    if (!options.silent) {
      logComponentCreated(trimmedComponentName, componentDir, options);
    }
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
  if (options.withStory) {
    createStoryFile(componentName, componentDir, extension);
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

function getStoryFileContent(componentName) {
  return `import ${componentName} from './${componentName}';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName}
};

export default meta;

export const Default = {};
`;
}

function createStoryFile(componentName, componentDir, componentExtension) {
  const storyExtension = componentExtension.includes('ts') ? 'tsx' : 'jsx';
  const storyFilePath = path.join(componentDir, `${componentName}.stories.${storyExtension}`);

  fs.writeFileSync(storyFilePath, getStoryFileContent(componentName));
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
  if (options.withStory) {
    createStoryFile(componentName, componentDir, componentExtension);
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
  initializeProject,
  getStarterTemplates,
  loadProjectConfig,
  mergeConfigWithCliOptions,
  normalizeTargetDir,
  buildComponentOptions,
  parseComponentNames,
  validateComponentBatch,
  formatGeneratedFiles,
  createComponents,
  getTestFileContent,
  getStoryFileContent,
  createComponent
};
