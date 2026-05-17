const ComponentFileContent = require('../ComponentFileContent');

describe('Component Type Templates', () => {
  const componentName = 'TestComponent';

  describe('Functional Component', () => {
    it('should generate functional component content', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', true, true, 'functional');
      const content = component.generateComponentContent();

      expect(content).toContain('import React from \'react\';');
      expect(content).toContain('import styles from \'./TestComponent.module.css\';');
      expect(content).toContain('function TestComponent(props)');
      expect(content).toContain('<div className={styles.root}>');
      expect(content).toContain('export default TestComponent');
    });

    it('should generate functional component with TypeScript', () => {
      const component = new ComponentFileContent(componentName, '.css', 'ts', true, true, 'functional');
      const content = component.generateComponentContent();

      expect(content).toContain('interface Props {}');
      expect(content).toContain('function TestComponent(props: Props)');
    });
  });

  describe('Arrow Function Component', () => {
    it('should generate arrow function component content', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', true, true, 'arrow');
      const content = component.generateComponentContent();

      expect(content).toContain('const TestComponent = (props) => {');
      expect(content).toContain('export default TestComponent');
    });

    it('should generate arrow function component with TypeScript', () => {
      const component = new ComponentFileContent(componentName, '.css', 'ts', true, true, 'arrow');
      const content = component.generateComponentContent();

      expect(content).toContain('interface Props {}');
      expect(content).toContain('const TestComponent = (props: Props) => {');
    });
  });

  describe('Class Component', () => {
    it('should generate class component content', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', true, false, 'class');
      const content = component.generateComponentContent();

      expect(content).toContain('import React from \'react\';');
      expect(content).toContain('class TestComponent extends React.Component');
      expect(content).toContain('constructor(props)');
      expect(content).toContain('render()');
    });

    it('should generate class component with TypeScript', () => {
      const component = new ComponentFileContent(componentName, '.css', 'ts', true, true, 'class');
      const content = component.generateComponentContent();

      expect(content).toContain('interface Props {}');
      expect(content).toContain('class TestComponent extends React.Component<Props>');
    });
  });

  describe('Memoized Component', () => {
    it('should generate memoized component content', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', true, true, 'memoized');
      const content = component.generateComponentContent();

      expect(content).toContain('import React, { memo } from \'react\';');
      expect(content).toContain('const TestComponent = memo((props) => {');
      expect(content).toContain('export default TestComponent');
    });

    it('should generate memoized component with TypeScript', () => {
      const component = new ComponentFileContent(componentName, '.css', 'ts', true, true, 'memoized');
      const content = component.generateComponentContent();

      expect(content).toContain('interface Props {}');
      expect(content).toContain('const TestComponent = memo((props: Props) => {');
    });
  });

  describe('ForwardRef Component', () => {
    it('should generate forwardRef component content', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', true, true, 'forwardRef');
      const content = component.generateComponentContent();

      expect(content).toContain('import React, { forwardRef } from \'react\';');
      expect(content).toContain('const TestComponent = forwardRef((props, ref) => {');
      expect(content).not.toContain('forwardRef<HTMLDivElement');
      expect(content).toContain('<div ref={ref} className={styles.root}>');
    });

    it('should generate forwardRef component with TypeScript', () => {
      const component = new ComponentFileContent(componentName, '.css', 'ts', true, true, 'forwardRef');
      const content = component.generateComponentContent();

      expect(content).toContain('interface Props {}');
      expect(content).toContain('const TestComponent = forwardRef<HTMLDivElement, Props>');
    });

    it('should generate valid forwardRef output without props', () => {
      const jsComponent = new ComponentFileContent(componentName, null, 'js', false, false, 'forwardRef');
      const tsComponent = new ComponentFileContent(componentName, null, 'ts', false, false, 'forwardRef');
      const jsContent = jsComponent.generateComponentContent();
      const tsContent = tsComponent.generateComponentContent();

      expect(jsContent).toContain('const TestComponent = forwardRef((props, ref) => {');
      expect(jsContent).not.toContain('forwardRef<HTMLDivElement');
      expect(jsContent).not.toContain('((, ref)');
      expect(tsContent).toContain('const TestComponent = forwardRef<HTMLDivElement>((_props, ref) => {');
      expect(tsContent).not.toContain('interface Props');
      expect(tsContent).not.toContain('((, ref)');
    });
  });

  describe('Component without props', () => {
    it('should generate component without props parameter', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', false, true, 'functional');
      const content = component.generateComponentContent();

      expect(content).toContain('function TestComponent()');
      expect(content).not.toContain('props');
    });
  });

  describe('Component without React import', () => {
    it('should generate component without React import', () => {
      const component = new ComponentFileContent(componentName, '.css', 'js', true, false, 'functional');
      const content = component.generateComponentContent();

      expect(content).not.toContain('import React from \'react\';');
    });
  });
});
