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
  
  constructor(
    componentName,
    hasStyles = this.#hasStyles,
    fileExtension = this.#fileExtension,
    hasProps = this.#hasProps,
    hasImportReact = this.#hasImportReact
  ) {
    if (!componentName) {
      throw new Error("Component name is required");
    }
    this.#hasStyles = hasStyles;
    this.#fileExtension = fileExtension;
    this.#hasProps = hasProps;
    this.#hasImportReact = hasImportReact;
    this.#componentName = componentName;
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
  get content() {
    return this.#content;
  }
  // generate the part of "import React from 'react'";
  #generateImportReact() {
    return this.#hasImportReact ? `import React from 'react';\n` : "";
  }
  // generate the part of props, considering if it is a ts file and if it is with props
  #generateProps() {
    if (this.fileExtension === "ts" && this.#hasProps) {
      return `interface Props {}\n`;
    }
    return "";
  }
  // generate the part of the component content, considering the style of the file is ts and if it is with props
  generateComponentContent() {
    const importReactContent = this.#generateImportReact();
    const propsObjectContent = this.#generateProps();
    let propsParamContent = "";
    if (this.#hasProps) {
      propsParamContent = this.fileExtension === "ts" ? "props: Props" : "props";
    }
    this.#content = `${importReactContent}
${propsObjectContent}
function ${this.componentName}(${propsParamContent}) {
    return (
      <>
      {/* Add your component content here */}
      </>
    );
};
export default ${this.componentName};
`;
    return this.#content;
  }
}

module.exports = ComponentFileContent;
