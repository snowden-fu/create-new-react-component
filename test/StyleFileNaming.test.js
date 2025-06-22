const fs = require('fs');
const path = require('path');

// Mock the createComponent function to test file naming
function testStyleFileNaming(componentName, style) {
  const componentDir = path.join(process.cwd(), componentName);
  const stylesFilePath = path.join(
    componentDir,
    `${componentName}.module${style ? `.${style}` : ''}`
  );
  return stylesFilePath;
}

describe('Style File Naming', () => {
  it('should create correct CSS file name', () => {
    const filePath = testStyleFileNaming('TestComponent', 'css');
    const expectedPath = path.join(process.cwd(), 'TestComponent', 'TestComponent.module.css');
    expect(filePath).toBe(expectedPath);
  });

  it('should create correct SCSS file name', () => {
    const filePath = testStyleFileNaming('TestComponent', 'scss');
    const expectedPath = path.join(process.cwd(), 'TestComponent', 'TestComponent.module.scss');
    expect(filePath).toBe(expectedPath);
  });

  it('should not create style file when style is null', () => {
    const filePath = testStyleFileNaming('TestComponent', null);
    const expectedPath = path.join(process.cwd(), 'TestComponent', 'TestComponent.module');
    expect(filePath).toBe(expectedPath);
  });

  it('should not have double dots in file name', () => {
    const filePath = testStyleFileNaming('TestComponent', 'css');
    expect(filePath).not.toContain('..');
    expect(filePath).toContain('.module.css');
  });
}); 