/**
 * @class ComponentFileContent
 * @description ComponentFileContent is a class that represents the content of a file.
 */
class ComponentFileContent {
  constructor(
    content = "",
    isWithStyles = false,
    style = "js",
    isWithProps = false,
    isImportReact = false
  ) {
    this.content = content;
    this.isWithStyles = isWithStyles;
    this.style = style;
    this.isWithProps = isWithProps;
    this.isImportReact = isImportReact;
  }
  // generate the part of "import React from 'react'";
  generateImportReact() {
    return this.isImportReact ? `import React from 'react';\n` : "";
  }
  // generate the part of props, considering if it is a ts file and if it is with props
  generateProps() {
    if (this.style === "ts" && this.isWithProps) {
      return `interface Props {}\n`;
    }
    return "";
  }
  // generate the part of the component content, considering the style of the file is ts and if it is with props
  generateComponentContent() {
    const propsContent = '';
    if (this.isWithProps) {
        propsContent = this.style === "ts" ? "{}:Props" : "props";
        }
    return `function ${this.componentName}(${propsContent}) {
        return (
            <>
            {/* Add your component content here */}
            </>
        );
        };

        exprt default ${this.componentName};
        `;
  }
}

module.exports = ComponentFileContent;