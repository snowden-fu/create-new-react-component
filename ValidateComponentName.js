/**
 * Comprehensive validation for React component names
 * @param {string} name - The component name to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
function validateComponentName(name) {
    // Handle null, undefined, or non-string inputs
    if (name === null || name === undefined || typeof name !== 'string') {
        return { isValid: false, error: 'Component name is required and must be a string' };
    }

    // Trim whitespace
    const trimmedName = name.trim();
    
    // Check for empty or whitespace-only names
    if (!trimmedName) {
        return { isValid: false, error: 'Component name cannot be empty or whitespace only' };
    }

    // Check for names ending with periods (Windows doesn't allow this)
    if (trimmedName.endsWith('.')) {
        return { isValid: false, error: 'Component name cannot end with a period or space' };
    }

    // Check length limits (filesystem and practical limits)
    if (trimmedName.length > 255) {
        return { isValid: false, error: 'Component name is too long (max 255 characters)' };
    }

    if (trimmedName.length < 2) {
        return { isValid: false, error: 'Component name must be at least 2 characters long' };
    }

    // Check for file system forbidden characters
    const forbiddenChars = /[<>:"|?*\\\/]/;
    if (forbiddenChars.test(trimmedName)) {
        return { isValid: false, error: 'Component name contains forbidden file system characters (< > : " | ? * \\ /)' };
    }


    // Check for Windows reserved names (case-insensitive)
    const windowsReservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (windowsReservedNames.includes(trimmedName.toUpperCase())) {
        return { isValid: false, error: `"${trimmedName}" is a reserved Windows filename` };
    }

    // Check for reserved JavaScript keywords
    const jsReservedKeywords = [
        'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 
        'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 
        'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 
        'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 
        'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 
        'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
    ];

    // Check against reserved keywords (case-insensitive)
    const lowerName = trimmedName.toLowerCase();
    if (jsReservedKeywords.includes(lowerName)) {
        return { isValid: false, error: `"${trimmedName}" is a reserved JavaScript keyword` };
    }

    // Check for React-specific reserved names (exact match)
    const reactReservedNames = [
        'Component', 'PureComponent', 'React', 'Fragment', 'StrictMode', 'Suspense', 'Profiler',
        'createElement', 'createContext', 'createRef', 'forwardRef', 'lazy', 'memo', 'useState',
        'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
        'useLayoutEffect', 'useDebugValue', 'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore',
        'ReactDOM', 'render', 'hydrate', 'unmountComponentAtNode', 'findDOMNode', 'createPortal'
    ];

    if (reactReservedNames.includes(trimmedName)) {
        return { isValid: false, error: `"${trimmedName}" is a reserved React name and may cause conflicts` };
    }

    // Check for common problematic names
    const problematicNames = [
        'Index', 'Main', 'App', 'Root', 'Container', 'Wrapper', 'Layout', 'Page', 'View', 'Screen',
        'Module', 'Export', 'Import', 'Default', 'Props', 'State', 'Ref', 'Key', 'Children',
        'Document', 'Window', 'Global', 'Console', 'Process', 'Buffer', 'Require'
    ];

    if (problematicNames.includes(trimmedName)) {
        return { isValid: false, error: `"${trimmedName}" is a common name that may cause conflicts. Consider a more specific name` };
    }

    // Check for valid PascalCase format - this should be last for format validation
    const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
    if (!pascalCaseRegex.test(trimmedName)) {
        return { isValid: false, error: 'Component name must be in PascalCase format (e.g., MyComponent)' };
    }

    return { isValid: true };
}

/**
 * Legacy function for backward compatibility
 * @param {string} name - The component name to validate
 * @returns {boolean} - true if valid, false otherwise
 */
function validateComponentNameLegacy(name) {
    const result = validateComponentName(name);
    return result.isValid;
}

module.exports = validateComponentName;
module.exports.legacy = validateComponentNameLegacy;