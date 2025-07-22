const validateComponentName = require('../ValidateComponentName');

// /test/ValidateComponentName.test.js

describe('validateComponentName', () => {
	// Valid cases
	test('should accept valid PascalCase component names', () => {
		expect(validateComponentName('MyComponent')).toEqual({ isValid: true });
		expect(validateComponentName('UserProfile')).toEqual({ isValid: true });
		expect(validateComponentName('NavigationMenu')).toEqual({ isValid: true });
	});

	test('should accept component names with numbers', () => {
		expect(validateComponentName('Component1')).toEqual({ isValid: true });
		expect(validateComponentName('My2Component')).toEqual({ isValid: true });
		expect(validateComponentName('Chart3D')).toEqual({ isValid: true });
	});

	test('should accept minimum length valid names', () => {
		expect(validateComponentName('My')).toEqual({ isValid: true });
		expect(validateComponentName('Ab')).toEqual({ isValid: true });
	});

	// Invalid cases - Basic validation
	test('should reject empty string', () => {
		expect(validateComponentName('')).toEqual({ 
			isValid: false, 
			error: 'Component name cannot be empty or whitespace only' 
		});
	});

	test('should reject whitespace-only names', () => {
		expect(validateComponentName('   ')).toEqual({ 
			isValid: false, 
			error: 'Component name cannot be empty or whitespace only' 
		});
		expect(validateComponentName('\t\n')).toEqual({ 
			isValid: false, 
			error: 'Component name cannot be empty or whitespace only' 
		});
	});

	test('should reject null or undefined', () => {
		expect(validateComponentName(null)).toEqual({ 
			isValid: false, 
			error: 'Component name is required and must be a string' 
		});
		expect(validateComponentName(undefined)).toEqual({ 
			isValid: false, 
			error: 'Component name is required and must be a string' 
		});
	});

	test('should reject non-string inputs', () => {
		expect(validateComponentName(123)).toEqual({ 
			isValid: false, 
			error: 'Component name is required and must be a string' 
		});
		expect(validateComponentName({})).toEqual({ 
			isValid: false, 
			error: 'Component name is required and must be a string' 
		});
	});

	// Length validation
	test('should reject names that are too short', () => {
		expect(validateComponentName('A')).toEqual({ 
			isValid: false, 
			error: 'Component name must be at least 2 characters long' 
		});
	});

	test('should reject names that are too long', () => {
		const longName = 'A'.repeat(256);
		expect(validateComponentName(longName)).toEqual({ 
			isValid: false, 
			error: 'Component name is too long (max 255 characters)' 
		});
	});

	// PascalCase validation
	test('should reject names starting with lowercase', () => {
		expect(validateComponentName('myComponent')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
		expect(validateComponentName('component')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
	});

	test('should reject names with special characters', () => {
		expect(validateComponentName('My-Component')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
		expect(validateComponentName('My_Component')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
		expect(validateComponentName('My$Component')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
	});

	test('should reject names with spaces', () => {
		expect(validateComponentName('My Component')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
	});

	test('should reject names starting with numbers', () => {
		expect(validateComponentName('123Component')).toEqual({ 
			isValid: false, 
			error: 'Component name must be in PascalCase format (e.g., MyComponent)' 
		});
	});

	// File system forbidden characters
	test('should reject names with forbidden characters', () => {
		expect(validateComponentName('My<Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My>Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My:Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My"Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My|Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My?Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My*Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My\\Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
		expect(validateComponentName('My/Component')).toEqual({ 
			isValid: false, 
			error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' 
		});
	});

	// Reserved JavaScript keywords
	test('should reject JavaScript reserved keywords', () => {
		expect(validateComponentName('Class')).toEqual({ 
			isValid: false, 
			error: '"Class" is a reserved JavaScript keyword' 
		});
		expect(validateComponentName('Function')).toEqual({ 
			isValid: false, 
			error: '"Function" is a reserved JavaScript keyword' 
		});
		expect(validateComponentName('Const')).toEqual({ 
			isValid: false, 
			error: '"Const" is a reserved JavaScript keyword' 
		});
		expect(validateComponentName('Import')).toEqual({ 
			isValid: false, 
			error: '"Import" is a reserved JavaScript keyword' 
		});
		expect(validateComponentName('Export')).toEqual({ 
			isValid: false, 
			error: '"Export" is a reserved JavaScript keyword' 
		});
	});

	// React reserved names
	test('should reject React reserved names', () => {
		expect(validateComponentName('Component')).toEqual({ 
			isValid: false, 
			error: '"Component" is a reserved React name and may cause conflicts' 
		});
		expect(validateComponentName('React')).toEqual({ 
			isValid: false, 
			error: '"React" is a reserved React name and may cause conflicts' 
		});
		expect(validateComponentName('Fragment')).toEqual({ 
			isValid: false, 
			error: '"Fragment" is a reserved React name and may cause conflicts' 
		});
		expect(validateComponentName('PureComponent')).toEqual({ 
			isValid: false, 
			error: '"PureComponent" is a reserved React name and may cause conflicts' 
		});
		expect(validateComponentName('useState')).toEqual({ 
			isValid: false, 
			error: '"useState" is a reserved React name and may cause conflicts' 
		});
	});

	// Problematic common names
	test('should reject problematic common names', () => {
		expect(validateComponentName('Index')).toEqual({ 
			isValid: false, 
			error: '"Index" is a common name that may cause conflicts. Consider a more specific name' 
		});
		expect(validateComponentName('Main')).toEqual({ 
			isValid: false, 
			error: '"Main" is a common name that may cause conflicts. Consider a more specific name' 
		});
		expect(validateComponentName('App')).toEqual({ 
			isValid: false, 
			error: '"App" is a common name that may cause conflicts. Consider a more specific name' 
		});
		expect(validateComponentName('Container')).toEqual({ 
			isValid: false, 
			error: '"Container" is a common name that may cause conflicts. Consider a more specific name' 
		});
	});

	// Windows reserved names
	test('should reject Windows reserved filenames', () => {
		expect(validateComponentName('Con')).toEqual({ 
			isValid: false, 
			error: '"Con" is a reserved Windows filename' 
		});
		expect(validateComponentName('PRN')).toEqual({ 
			isValid: false, 
			error: '"PRN" is a reserved Windows filename' 
		});
		expect(validateComponentName('Aux')).toEqual({ 
			isValid: false, 
			error: '"Aux" is a reserved Windows filename' 
		});
		expect(validateComponentName('COM1')).toEqual({ 
			isValid: false, 
			error: '"COM1" is a reserved Windows filename' 
		});
	});

	// Names ending with periods
	test('should reject names ending with periods', () => {
		expect(validateComponentName('MyComponent.')).toEqual({ 
			isValid: false, 
			error: 'Component name cannot end with a period or space' 
		});
	});

	// Test whitespace trimming
	test('should trim whitespace and validate trimmed name', () => {
		expect(validateComponentName('  MyComponent  ')).toEqual({ isValid: true });
		expect(validateComponentName('\tMyComponent\n')).toEqual({ isValid: true });
	});
});

// Legacy compatibility tests
describe('validateComponentName.legacy (backward compatibility)', () => {
	const validateComponentNameLegacy = require('../ValidateComponentName').legacy;

	test('should maintain backward compatibility with boolean return', () => {
		expect(validateComponentNameLegacy('MyComponent')).toBe(true);
		expect(validateComponentNameLegacy('myComponent')).toBe(false);
		expect(validateComponentNameLegacy('')).toBe(false);
		expect(validateComponentNameLegacy('Component')).toBe(false); // Now blocked as reserved
	});
});