const validateComponentName = require('../ValidateComponentName');

// /test/ValidateComponentName.test.js


describe('validateComponentName', () => {
	// Valid cases
	test('should accept valid PascalCase component names', () => {
		expect(validateComponentName('MyComponent')).toBe(true);
		expect(validateComponentName('Component')).toBe(true);
		expect(validateComponentName('X')).toBe(true);
	});

	test('should accept component names with numbers', () => {
		expect(validateComponentName('Component1')).toBe(true);
		expect(validateComponentName('My2Component')).toBe(true);
	});

	// Invalid cases
	test('should reject empty string', () => {
		expect(validateComponentName('')).toBe(false);
	});

	test('should reject names starting with lowercase', () => {
		expect(validateComponentName('myComponent')).toBe(false);
		expect(validateComponentName('component')).toBe(false);
	});

	test('should reject names with special characters', () => {
		expect(validateComponentName('My-Component')).toBe(false);
		expect(validateComponentName('My_Component')).toBe(false);
		expect(validateComponentName('My$Component')).toBe(false);
	});

	test('should reject names with spaces', () => {
		expect(validateComponentName('My Component')).toBe(false);
	});

	test('should reject null or undefined', () => {
		expect(validateComponentName(null)).toBe(false);
		expect(validateComponentName(undefined)).toBe(false);
	});
});