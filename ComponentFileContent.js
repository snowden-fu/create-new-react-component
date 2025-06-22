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
  // generate the part of "import React from 'react'";
  #generateImportReact() {
    return this.#hasImportReact ? `import React from 'react';\n` : "";
  }
  // generate additional React imports based on component type
  #generateAdditionalImports() {
    let imports = "";
    
    if (this.#componentType === "memoized") {
      imports += `import { memo } from 'react';\n`;
    } else if (this.#componentType === "forwardRef") {
      imports += `import { forwardRef } from 'react';\n`;
    }
    
    return imports;
  }
  // generate the part of props, considering if it is a ts file and if it is with props
  #generateProps() {
    if (this.fileExtension === "ts" && this.#hasProps) {
      return `interface Props {}\n`;
    }
    return "";
  }
  // generate functional component
  #generateFunctionalComponent() {
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "props: Props" : "props";
    }
    
    return `function ${this.componentName}(${propsParamContent}) {
    return (
      <>
        {/* Add your component content here */}
      </>
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
      <>
        {/* Add your component content here */}
      </>
    );
}`;
  }
  // generate class component
  #generateClassComponent() {
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "Props" : "";
    }
    
    return `class ${this.componentName} extends React.Component${propsParamContent ? `<${propsParamContent}>` : ''} {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <>
                {/* Add your component content here */}
            </>
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
        <>
            {/* Add your component content here */}
        </>
    );
});`;
  }
  // generate forwardRef component
  #generateForwardRefComponent() {
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "props: Props" : "props";
    }
    
    return `const ${this.componentName} = forwardRef<HTMLDivElement, ${this.fileExtension === "ts" ? "Props" : "any"}>((${propsParamContent}, ref) => {
    return (
        <div ref={ref}>
            {/* Add your component content here */}
        </div>
    );
});`;
  }
  // generate the component content based on type
  generateComponentContent() {
    const importReactContent = this.#generateImportReact();
    const additionalImports = this.#generateAdditionalImports();
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
    
    this.#content = `${importReactContent}${additionalImports}
${propsObjectContent}
${componentContent}

export default ${this.componentName};`;
    
    return this.#content;
  }
}

module.exports = ComponentFileContent;
