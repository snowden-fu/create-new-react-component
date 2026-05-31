const fs = require('fs');
const path = require('path');
const os = require('os');

const { createComponent } = require('../index');

describe('Style File Naming', () => {
  let tempDir;
  let originalCwd;
  let consoleSpy;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'component-style-test-'));
    process.chdir(tempDir);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should create a CSS module and import it from the component', () => {
    createComponent('TestComponent', {
      componentType: 'functional',
      lang: 'js',
      style: 'css',
      withProps: false,
      withImportReact: false
    });

    const componentPath = path.join(tempDir, 'TestComponent', 'TestComponent.jsx');
    const stylePath = path.join(tempDir, 'TestComponent', 'TestComponent.module.css');

    expect(fs.existsSync(stylePath)).toBe(true);
    expect(fs.readFileSync(stylePath, 'utf8')).toContain('.root');
    expect(fs.readFileSync(componentPath, 'utf8')).toContain("import styles from './TestComponent.module.css';");
    expect(fs.readFileSync(componentPath, 'utf8')).toContain('className={styles.root}');
  });

  it('should create a SCSS module with the correct file name', () => {
    createComponent('TestComponent', {
      componentType: 'functional',
      lang: 'js',
      style: 'scss',
      withProps: false,
      withImportReact: false
    });

    const stylePath = path.join(tempDir, 'TestComponent', 'TestComponent.module.scss');

    expect(fs.existsSync(stylePath)).toBe(true);
    expect(stylePath).not.toContain('..');
  });

  it('should not create or import a style file when style is null', () => {
    createComponent('TestComponent', {
      componentType: 'functional',
      lang: 'js',
      style: null,
      withProps: false,
      withImportReact: false
    });

    const componentPath = path.join(tempDir, 'TestComponent', 'TestComponent.jsx');

    expect(fs.existsSync(path.join(tempDir, 'TestComponent', 'TestComponent.module'))).toBe(false);
    expect(fs.readFileSync(componentPath, 'utf8')).not.toContain('import styles');
  });

  it('should create the component folder inside a target directory', () => {
    const targetDir = path.join(tempDir, 'src', 'components');
    const componentDir = createComponent('TestComponent', {
      componentType: 'functional',
      lang: 'ts',
      style: 'scss',
      withProps: true,
      withImportReact: false,
      targetDir
    });

    expect(componentDir).toBe(path.join(targetDir, 'TestComponent'));
    expect(fs.existsSync(path.join(targetDir, 'TestComponent', 'TestComponent.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'TestComponent', 'TestComponent.module.scss'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'TestComponent', 'index.ts'))).toBe(true);
  });

  it('should create a JavaScript test file when requested', () => {
    createComponent('TestComponent', {
      componentType: 'functional',
      lang: 'js',
      style: 'css',
      withProps: false,
      withImportReact: false,
      withTest: true
    });

    const testPath = path.join(tempDir, 'TestComponent', 'TestComponent.test.jsx');
    const testContent = fs.readFileSync(testPath, 'utf8');

    expect(fs.existsSync(testPath)).toBe(true);
    expect(testContent).toContain("import { render, screen } from '@testing-library/react';");
    expect(testContent).toContain("import TestComponent from './TestComponent';");
    expect(testContent).toContain('render(<TestComponent />);');
  });

  it('should create a TypeScript test file when requested', () => {
    createComponent('TestComponent', {
      componentType: 'functional',
      lang: 'ts',
      style: 'scss',
      withProps: false,
      withImportReact: false,
      withTest: true
    });

    expect(fs.existsSync(path.join(tempDir, 'TestComponent', 'TestComponent.test.tsx'))).toBe(true);
  });

  it('should create custom-template components inside a target directory', () => {
    const targetDir = path.join(tempDir, 'src', 'components');
    const templatePath = path.join(tempDir, 'custom-template.tsx');

    fs.writeFileSync(templatePath, `const {{ComponentName}} = () => <div>{{componentName}}</div>;
export default {{ComponentName}};`);

    createComponent('TestComponent', {
      targetDir,
      customTemplate: {
        name: 'custom-template',
        path: templatePath,
        type: 'file'
      }
    });

    const componentPath = path.join(targetDir, 'TestComponent', 'TestComponent.tsx');

    expect(fs.existsSync(componentPath)).toBe(true);
    expect(fs.readFileSync(componentPath, 'utf8')).toContain('const TestComponent');
    expect(fs.existsSync(path.join(targetDir, 'TestComponent', 'index.ts'))).toBe(true);
  });

  it('should create custom-template test files when requested', () => {
    const templatePath = path.join(tempDir, 'custom-template.tsx');

    fs.writeFileSync(templatePath, `const {{ComponentName}} = () => <div>{{componentName}}</div>;
export default {{ComponentName}};`);

    createComponent('TestComponent', {
      withTest: true,
      customTemplate: {
        name: 'custom-template',
        path: templatePath,
        type: 'file'
      }
    });

    expect(fs.existsSync(path.join(tempDir, 'TestComponent', 'TestComponent.test.tsx'))).toBe(true);
  });
});
