/**
 * @class ComponentFileContent
 * @description ComponentFileContent is a class that represents the content of a file.
 */
class ComponentFileContent {
  // private properties
  #content = "";
  #hasStyles = false;
  #style = "js";
  #hasProps = false;
  #hasImportReact = false;
  #componentName = "";
  constructor(
    componentName,
    hasStyles = this.#hasStyles,
    style = this.#style,
    hasProps = this.#hasProps,
    hasImportReact = this.#hasImportReact
  ) {
    if (!componentName) {
      throw new Error("Component name is required");
    }
    this.#hasStyles = hasStyles;
    this.#style = style;
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
  get style() {
    return this.#style;
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
    return this.isImportReact ? `import React from 'react';\n` : "";
  }
  // generate the part of props, considering if it is a ts file and if it is with props
  #generateProps() {
    if (this.style === "ts" && this.isWithProps) {
      return `interface Props {}\n`;
    }
    return "";
  }
  // generate the part of the component content, considering the style of the file is ts and if it is with props
  generateComponentContent() {
    const importReactContent = this.#generateImportReact();
    const propsObjectContent = this.#generateProps();
    let propsParamContent = "";
    if (this.isWithProps) {
      propsParamContent = this.style === "ts" ? "{}:Props" : "props";
    }
    this.#content = `
${importReactContent}
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
