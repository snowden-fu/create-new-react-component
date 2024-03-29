/**
 * This is a test file for ComponentFileContent
 */
const ComponentFileContent = require('./ComponentFileContent');

describe('ComponentFileContent', () => {
    it('should initialize with default values', () => {
        const componentFileContent = new ComponentFileContent();
        expect(componentFileContent.content).toBe("");
        expect(componentFileContent.isWithStyles).toBe(false);
        expect(componentFileContent.style).toBe("js");
        expect(componentFileContent.isWithProps).toBe(false);
        expect(componentFileContent.isImportReact).toBe(false);
    })
})