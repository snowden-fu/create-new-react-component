const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  getAvailableCustomTemplates,
  loadCustomTemplate,
  extractTemplateVariables,
  replaceTemplateVariables,
  validateTemplate,
  loadProjectConfig,
  mergeConfigWithCliOptions,
  normalizeTargetDir,
  buildComponentOptions
} = require('../index');

describe('Template Customization', () => {
  let tempDir;
  let tempFile;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-test-'));
    tempFile = path.join(tempDir, 'custom-component.jsx');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('getAvailableCustomTemplates', () => {
    it('should find templates in directory', () => {
      const templateContent = `import React from 'react';

const {{ComponentName}} = () => {
  return <div>{{componentName}}</div>;
};

export default {{ComponentName}};`;

      fs.writeFileSync(tempFile, templateContent);

      const templates = getAvailableCustomTemplates(tempDir);
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('custom-component');
      expect(templates[0].path).toBe(tempFile);
    });

    it('should find specific template file', () => {
      const templateContent = `const {{ComponentName}} = () => <div />;
export default {{ComponentName}};`;

      fs.writeFileSync(tempFile, templateContent);

      const templates = getAvailableCustomTemplates(null, tempFile);
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('custom-component');
    });

    it('should return empty array for non-existent paths', () => {
      const templates = getAvailableCustomTemplates('/non/existent/path');
      expect(templates).toHaveLength(0);
    });
  });

  describe('extractTemplateVariables', () => {
    it('should extract template variables', () => {
      const content = `
        const {{ComponentName}} = () => {
          return <div className="{{component_name}}">{{componentName}}</div>;
        };
      `;

      const variables = extractTemplateVariables(content);
      expect(variables).toContain('ComponentName');
      expect(variables).toContain('component_name');
      expect(variables).toContain('componentName');
    });

    it('should handle content without variables', () => {
      const content = `const MyComponent = () => <div />;`;
      const variables = extractTemplateVariables(content);
      expect(variables).toHaveLength(0);
    });
  });

  describe('replaceTemplateVariables', () => {
    it('should replace template variables', () => {
      const content = `const {{ComponentName}} = () => <div>{{componentName}}</div>;`;
      const variables = {
        ComponentName: 'TestComponent',
        componentName: 'testComponent'
      };

      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('const TestComponent = () => <div>testComponent</div>;');
    });

    it('should handle multiple occurrences of the same variable', () => {
      const content = `{{ComponentName}} {{ComponentName}}`;
      const variables = { ComponentName: 'Test' };

      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('Test Test');
    });
  });

  describe('validateTemplate', () => {
    it('should pass valid React component template', () => {
      const content = `import React from 'react';
const {{ComponentName}} = () => <div />;
export default {{ComponentName}};`;

      expect(() => validateTemplate(content, 'test.jsx')).not.toThrow();
    });

    it('should warn about missing export', () => {
      const content = `const {{ComponentName}} = () => <div />;`;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      validateTemplate(content, 'test.jsx');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('may not have a proper export statement')
      );

      consoleSpy.mockRestore();
    });

    it('should warn about missing component name variable', () => {
      const content = `const MyComponent = () => <div />;
export default MyComponent;`;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      validateTemplate(content, 'test.jsx');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not use {{componentName}} or {{ComponentName}} variables')
      );

      consoleSpy.mockRestore();
    });

    it('should reject dangerous patterns', () => {
      const dangerousContent = `
const {{ComponentName}} = () => {
  eval('malicious code');
  return <div />;
};
export default {{ComponentName}};`;

      expect(() => validateTemplate(dangerousContent, 'test.jsx')).toThrow(
        'Template contains potentially dangerous code'
      );
    });

    it('should reject child_process require', () => {
      const dangerousContent = `
const cp = require('child_process');
const {{ComponentName}} = () => <div />;
export default {{ComponentName}};`;

      expect(() => validateTemplate(dangerousContent, 'test.jsx')).toThrow(
        'Template contains potentially dangerous code'
      );
    });
  });

  describe('loadCustomTemplate', () => {
    it('should load and validate template', () => {
      const content = `import React from 'react';
const {{ComponentName}} = () => <div>{{componentName}}</div>;
export default {{ComponentName}};`;

      fs.writeFileSync(tempFile, content);

      const template = loadCustomTemplate(tempFile);
      expect(template.content).toBe(content);
      expect(template.variables).toContain('ComponentName');
      expect(template.variables).toContain('componentName');
    });

    it('should throw error for non-existent file', () => {
      expect(() => loadCustomTemplate('/non/existent/file.jsx')).toThrow(
        'Failed to load template'
      );
    });

    it('should throw error for dangerous template', () => {
      const dangerousContent = `
const {{ComponentName}} = () => {
  process.exit(1);
  return <div />;
};`;

      fs.writeFileSync(tempFile, dangerousContent);

      expect(() => loadCustomTemplate(tempFile)).toThrow(
        'Failed to load template'
      );
    });
  });

  describe('buildComponentOptions', () => {
    it('should build defaults for non-interactive generation', () => {
      expect(buildComponentOptions({})).toEqual(expect.objectContaining({
        componentType: 'functional',
        lang: 'js',
        style: 'css',
        withProps: false,
        withImportReact: false,
        withTest: false,
        withStory: false,
        targetDir: process.cwd(),
        customTemplate: null
      }));
    });

    it('should normalize none styles and force React import for class components', () => {
      expect(buildComponentOptions({
        type: 'class',
        lang: 'ts',
        style: 'none',
        withProps: true
      })).toEqual(expect.objectContaining({
        componentType: 'class',
        lang: 'ts',
        style: null,
        withProps: true,
        withImportReact: true,
        withTest: false,
        withStory: false,
        targetDir: process.cwd(),
        customTemplate: null
      }));
    });

    it('should reject unsupported CLI option values', () => {
      expect(() => buildComponentOptions({ type: 'server' })).toThrow('type must be one of');
      expect(() => buildComponentOptions({ lang: 'tsx' })).toThrow('lang must be one of');
      expect(() => buildComponentOptions({ style: 'less' })).toThrow('style must be one of');
    });

    it('should resolve a target directory option', () => {
      expect(buildComponentOptions({ dir: 'src/components' })).toEqual(expect.objectContaining({
        targetDir: path.resolve(process.cwd(), 'src/components')
      }));
    });

    it('should include test generation when requested', () => {
      expect(buildComponentOptions({ withTest: true })).toEqual(expect.objectContaining({
        withTest: true
      }));
    });

    it('should include story generation when requested', () => {
      expect(buildComponentOptions({ withStory: true })).toEqual(expect.objectContaining({
        withStory: true
      }));
    });

    it('should load supported project config fields from .cnrc.json', () => {
      fs.writeFileSync(path.join(tempDir, '.cnrc.json'), JSON.stringify({
        lang: 'ts',
        style: 'scss',
        componentType: 'arrow',
        withProps: true,
        withReactImport: true,
        withTest: true,
        withStory: true,
        format: true,
        baseDir: 'src/components'
      }));

      expect(loadProjectConfig(tempDir)).toEqual({
        lang: 'ts',
        style: 'scss',
        componentType: 'arrow',
        withProps: true,
        withReactImport: true,
        withTest: true,
        withStory: true,
        format: true,
        baseDir: 'src/components'
      });
    });

    it('should return an empty config when .cnrc.json is not present', () => {
      expect(loadProjectConfig(tempDir)).toEqual({});
    });

    it('should reject unsupported project config values', () => {
      fs.writeFileSync(path.join(tempDir, '.cnrc.json'), JSON.stringify({
        lang: 'tsx'
      }));

      expect(() => loadProjectConfig(tempDir)).toThrow('lang must be one of');
    });

    it('should reject unsupported project config fields', () => {
      fs.writeFileSync(path.join(tempDir, '.cnrc.json'), JSON.stringify({
        outputDir: 'src/components'
      }));

      expect(() => loadProjectConfig(tempDir)).toThrow('unsupported field');
    });

    it('should merge config values over defaults', () => {
      expect(buildComponentOptions({}, {
        componentType: 'arrow',
        lang: 'ts',
        style: 'scss',
        withProps: true,
        withReactImport: true,
        withTest: true,
        withStory: true,
        format: true,
        baseDir: 'src/components'
      })).toEqual(expect.objectContaining({
        componentType: 'arrow',
        lang: 'ts',
        style: 'scss',
        withProps: true,
        withImportReact: true,
        withTest: true,
        withStory: true,
        format: true,
        targetDir: path.resolve(process.cwd(), 'src/components')
      }));
    });

    it('should let CLI flags override project config values', () => {
      expect(buildComponentOptions({
        type: 'memoized',
        lang: 'js',
        style: 'none',
        dir: 'lib/ui',
        withReactImport: true
      }, {
        componentType: 'arrow',
        lang: 'ts',
        style: 'scss',
        withProps: true,
        withTest: true,
        withStory: true,
        baseDir: 'src/components'
      })).toEqual(expect.objectContaining({
        componentType: 'memoized',
        lang: 'js',
        style: null,
        withProps: true,
        withImportReact: true,
        withTest: true,
        withStory: true,
        targetDir: path.resolve(process.cwd(), 'lib/ui')
      }));
    });

    it('should map config and CLI fields into a single option shape', () => {
      expect(mergeConfigWithCliOptions({
        lang: 'js',
        dir: 'components'
      }, {
        lang: 'ts',
        componentType: 'forwardRef',
        baseDir: 'src/components',
        withTest: true,
        withStory: true
      })).toEqual(expect.objectContaining({
        type: 'forwardRef',
        lang: 'js',
        dir: 'components',
        withTest: true,
        withStory: true
      }));
    });

    it('should resolve a custom template for non-interactive generation', () => {
      const content = `const {{ComponentName}} = () => <div />;
export default {{ComponentName}};`;

      fs.writeFileSync(tempFile, content);

      expect(buildComponentOptions({ template: tempFile })).toEqual(expect.objectContaining({
        customTemplate: {
          name: 'custom-component',
          path: tempFile,
          type: 'file'
        }
      }));
    });

    it('should reject empty target directory values', () => {
      expect(() => normalizeTargetDir('  ')).toThrow('dir cannot be empty');
    });
  });
});
