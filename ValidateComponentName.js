function validateComponentName(name) {
    // Check for valid React component naming (PascalCase)
    const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
    return pascalCaseRegex.test(name);
  }

module.exports = validateComponentName;