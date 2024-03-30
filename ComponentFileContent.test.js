/**
 * This is a test file for ComponentFileContent
 */
const ComponentFileContent = require('./ComponentFileContent');
const componenetName = 'TestComponent';
describe('ComponentFileContent', () => {
    it('should initialize with default values', () => {
        const componentFileContent = new ComponentFileContent(componenetName);
        expect(componentFileContent.componentName).toBe(componenetName);
        expect(componentFileContent.hasStyles).toBe(false);
        expect(componentFileContent.style).toBe('js');
        expect(componentFileContent.hasProps).toBe(false);
        expect(componentFileContent.hasImportReact).toBe(false);
    })
    it('should throw an error if no componentName is provided', () => {
        expect(() => new ComponentFileContent()).toThrow('Component name is required');
    })
})