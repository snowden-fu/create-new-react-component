/**
 * @class ComponentFileContent
 * @description ComponentFileContent is a class that represents the content of a file.
 */
class ComponentFileContent {
  // private properties
  #content = "";
  #hasStyles = false;
  #fileExtension = "js";
  #hasProps = false;
  #hasImportReact = false;
  #componentName = "";
  #componentType = "functional";
  
  constructor(
    componentName,
    hasStyles = this.#hasStyles,
    fileExtension = this.#fileExtension,
    hasProps = this.#hasProps,
    hasImportReact = this.#hasImportReact,
    componentType = this.#componentType
  ) {
    if (!componentName) {
      throw new Error("Component name is required");
    }
    this.#hasStyles = hasStyles;
    this.#fileExtension = fileExtension;
    this.#hasProps = hasProps;
    this.#hasImportReact = hasImportReact;
    this.#componentName = componentName;
    this.#componentType = componentType;
  }
  
  get componentName() {
    return this.#componentName;
  }
  get hasStyles() {
    return this.#hasStyles;
  }
  get fileExtension() {
    return this.#fileExtension;
  }
  get hasProps() {
    return this.#hasProps;
  }
  get hasImportReact() {
    return this.#hasImportReact;
  }
  get componentType() {
    return this.#componentType;
  }
  get content() {
    return this.#content;
  }
  #needsDefaultReactImport() {
    return this.#hasImportReact || this.#componentType === "class";
  }
  // generate React imports required by the selected template
  #generateReactImports() {
    const namedImports = [];

    if (this.#componentType === "memoized") {
      namedImports.push("memo");
    } else if (this.#componentType === "forwardRef") {
      namedImports.push("forwardRef");
    }

    if (this.#needsDefaultReactImport() && namedImports.length > 0) {
      return `import React, { ${namedImports.join(", ")} } from 'react';\n`;
    }

    if (this.#needsDefaultReactImport()) {
      return `import React from 'react';\n`;
    }

    if (namedImports.length > 0) {
      return `import { ${namedImports.join(", ")} } from 'react';\n`;
    }

    return "";
  }
  #generateStyleImport() {
    return this.#hasStyles ? `import styles from './${this.componentName}.module${this.#hasStyles}';\n` : "";
  }
  // generate the part of props, considering if it is a ts file and if it is with props
  #generateProps() {
    if (this.fileExtension === "ts" && this.#hasProps) {
      return `interface Props {}\n`;
    }
    return "";
  }
  #generateWrapperStart(indent = "") {
    return this.#hasStyles ? `${indent}<div className={styles.root}>` : `${indent}<>`;
  }
  #generateWrapperEnd(indent = "") {
    return this.#hasStyles ? `${indent}</div>` : `${indent}</>`;
  }
  // generate functional component
  #generateFunctionalComponent() {
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "props: Props" : "props";
    }
    
    return `function ${this.componentName}(${propsParamContent}) {
    return (
${this.#generateWrapperStart("      ")}
        {/* Add your component content here */}
${this.#generateWrapperEnd("      ")}
    );
}`;
  }
  // generate arrow function component
  #generateArrowFunctionComponent() {
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "props: Props" : "props";
    }
    
    return `const ${this.componentName} = (${propsParamContent}) => {
    return (
${this.#generateWrapperStart("      ")}
        {/* Add your component content here */}
${this.#generateWrapperEnd("      ")}
    );
}`;
  }
  // generate class component
  #generateClassComponent() {
    const propsGeneric = this.#hasProps && this.fileExtension === "ts" ? "<Props>" : "";
    const constructorProps = this.fileExtension === "ts" && this.#hasProps ? "props: Props" : "props";
    const constructorBlock = this.#hasProps ? `    constructor(${constructorProps}) {
        super(props);
        this.state = {};
    }

` : "";

    return `class ${this.componentName} extends React.Component${propsGeneric} {
${constructorBlock}    render() {
        return (
${this.#generateWrapperStart("            ")}
                {/* Add your component content here */}
${this.#generateWrapperEnd("            ")}
        );
    }
}`;
  }
  // generate memoized component
  #generateMemoizedComponent() {
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "props: Props" : "props";
    }
    
    return `const ${this.componentName} = memo((${propsParamContent}) => {
    return (
${this.#generateWrapperStart("        ")}
            {/* Add your component content here */}
${this.#generateWrapperEnd("        ")}
    );
});`;
  }
  // generate forwardRef component
  #generateForwardRefComponent() {
    const typeParameters = this.fileExtension === "ts"
      ? `<HTMLDivElement${this.#hasProps ? ", Props" : ""}>`
      : "";
    const propsParamContent = this.fileExtension === "ts"
      ? (this.#hasProps ? "props: Props" : "_props")
      : "props";
    const classNameContent = this.#hasStyles ? " className={styles.root}" : "";
    
    return `const ${this.componentName} = forwardRef${typeParameters}((${propsParamContent}, ref) => {
    return (
        <div ref={ref}${classNameContent}>
            {/* Add your component content here */}
        </div>
    );
});`;
  }
  // generate the component content based on type
  generateComponentContent() {
    const importReactContent = this.#generateReactImports();
    const styleImportContent = this.#generateStyleImport();
    const propsObjectContent = this.#generateProps();
    
    let componentContent = "";
    
    switch (this.#componentType) {
      case "functional":
        componentContent = this.#generateFunctionalComponent();
        break;
      case "arrow":
        componentContent = this.#generateArrowFunctionComponent();
        break;
      case "class":
        componentContent = this.#generateClassComponent();
        break;
      case "memoized":
        componentContent = this.#generateMemoizedComponent();
        break;
      case "forwardRef":
        componentContent = this.#generateForwardRefComponent();
        break;
      default:
        componentContent = this.#generateFunctionalComponent();
    }
    
    this.#content = [
      `${importReactContent}${styleImportContent}`.trimEnd(),
      propsObjectContent.trimEnd(),
      componentContent,
      `export default ${this.componentName};`
    ].filter(Boolean).join("\n\n");
    
    return this.#content;
  }
}

module.exports = ComponentFileContent;
