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
});
