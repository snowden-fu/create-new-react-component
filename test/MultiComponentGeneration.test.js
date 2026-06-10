const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const prettier = require("prettier");

const {
  createComponents,
  parseComponentNames,
  validateComponentBatch
} = require("../index");

describe("Multi-component generation", () => {
  let tempDir;
  let consoleSpy;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "component-batch-test-"));
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("parses arrays, spaces, and commas into component names", () => {
    expect(parseComponentNames(["Button", "Card,Modal"])).toEqual([
      "Button",
      "Card",
      "Modal"
    ]);
    expect(parseComponentNames("Button Card, Modal")).toEqual([
      "Button",
      "Card",
      "Modal"
    ]);
  });

  it("rejects invalid, duplicate, and existing names before writing", async () => {
    fs.mkdirSync(path.join(tempDir, "ExistingCard"));

    expect(() =>
      validateComponentBatch(["Button", "Button"], tempDir)
    ).toThrow("Duplicate component name: Button");
    expect(() =>
      validateComponentBatch(["validName"], tempDir)
    ).toThrow("validName: Component name must be in PascalCase");

    await expect(
      createComponents(["FreshCard", "ExistingCard"], {
        componentType: "functional",
        lang: "js",
        style: "css",
        targetDir: tempDir
      })
    ).rejects.toThrow(`Component ExistingCard already exists in ${tempDir}`);

    expect(fs.existsSync(path.join(tempDir, "FreshCard"))).toBe(false);
  });

  it("creates a batch with shared styles, tests, and target directory", async () => {
    const targetDir = path.join(tempDir, "src", "components");

    const componentDirs = await createComponents(["Button", "UserCard"], {
      componentType: "arrow",
      lang: "ts",
      style: "scss",
      withProps: true,
      withImportReact: false,
      withTest: true,
      targetDir
    });

    expect(componentDirs).toEqual([
      path.join(targetDir, "Button"),
      path.join(targetDir, "UserCard")
    ]);

    ["Button", "UserCard"].forEach((componentName) => {
      const componentDir = path.join(targetDir, componentName);
      expect(
        fs.existsSync(path.join(componentDir, `${componentName}.tsx`))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(componentDir, `${componentName}.module.scss`))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(componentDir, `${componentName}.test.tsx`))
      ).toBe(true);
      expect(fs.existsSync(path.join(componentDir, "index.ts"))).toBe(true);
    });
  });

  it("creates multiple components from one custom template", async () => {
    const templatePath = path.join(tempDir, "custom-template.tsx");
    fs.writeFileSync(
      templatePath,
      "const {{ComponentName}}=()=> <div>{{componentName}}</div>; export default {{ComponentName}};"
    );

    await createComponents("Button, UserCard", {
      targetDir: tempDir,
      format: true,
      customTemplate: {
        name: "custom-template",
        path: templatePath,
        type: "file"
      }
    });

    expect(
      fs.readFileSync(path.join(tempDir, "Button", "Button.tsx"), "utf8")
    ).toBe(
      "const Button = () => <div>Button</div>;\nexport default Button;\n"
    );
    expect(
      fs.readFileSync(
        path.join(tempDir, "UserCard", "UserCard.tsx"),
        "utf8"
      )
    ).toBe(
      "const UserCard = () => <div>UserCard</div>;\nexport default UserCard;\n"
    );
  });

  it("formats all generated files with the nearest Prettier config", async () => {
    fs.writeFileSync(
      path.join(tempDir, ".prettierrc"),
      JSON.stringify({ singleQuote: false, tabWidth: 4 })
    );

    await createComponents(["Button", "UserCard"], {
      componentType: "arrow",
      lang: "ts",
      style: "css",
      withProps: true,
      withImportReact: false,
      withTest: true,
      format: true,
      targetDir: tempDir
    });

    const componentContent = fs.readFileSync(
      path.join(tempDir, "Button", "Button.tsx"),
      "utf8"
    );
    const indexContent = fs.readFileSync(
      path.join(tempDir, "Button", "index.ts"),
      "utf8"
    );
    const testContent = fs.readFileSync(
      path.join(tempDir, "Button", "Button.test.tsx"),
      "utf8"
    );
    const styleContent = fs.readFileSync(
      path.join(tempDir, "Button", "Button.module.css"),
      "utf8"
    );

    expect(componentContent).toContain(
      'import styles from "./Button.module.css";'
    );
    expect(componentContent).toContain("    return (");
    expect(indexContent).toBe('export { default } from "./Button";\n');
    expect(testContent).toContain(
      'import { render, screen } from "@testing-library/react";'
    );
    expect(styleContent).toContain(".root {");
  });

  it("removes only batch directories when formatting fails", async () => {
    const existingDir = path.join(tempDir, "ExistingWork");
    fs.mkdirSync(existingDir);
    fs.writeFileSync(path.join(existingDir, "keep.txt"), "keep");
    jest.spyOn(prettier, "format").mockImplementationOnce(() => {
      throw new Error("format failed");
    });

    await expect(
      createComponents(["Button", "UserCard"], {
        componentType: "functional",
        lang: "js",
        style: "css",
        format: true,
        targetDir: tempDir
      })
    ).rejects.toThrow("format failed");

    expect(fs.existsSync(path.join(tempDir, "Button"))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, "UserCard"))).toBe(false);
    expect(fs.readFileSync(path.join(existingDir, "keep.txt"), "utf8")).toBe(
      "keep"
    );
  });

  it("accepts variadic names through the CLI", () => {
    const cliPath = path.resolve(__dirname, "..", "index.js");

    execFileSync(
      process.execPath,
      [cliPath, "Button", "UserCard", "--style", "none"],
      { cwd: tempDir, stdio: "pipe" }
    );

    expect(fs.existsSync(path.join(tempDir, "Button", "Button.jsx"))).toBe(
      true
    );
    expect(
      fs.existsSync(path.join(tempDir, "UserCard", "UserCard.jsx"))
    ).toBe(true);
  });

  it("applies batch and formatting defaults from .cnrc.json", () => {
    const cliPath = path.resolve(__dirname, "..", "index.js");
    fs.writeFileSync(
      path.join(tempDir, ".cnrc.json"),
      JSON.stringify({
        lang: "ts",
        style: "scss",
        componentType: "arrow",
        withTest: true,
        format: true
      })
    );

    execFileSync(process.execPath, [cliPath, "Button", "UserCard"], {
      cwd: tempDir,
      stdio: "pipe"
    });

    const componentContent = fs.readFileSync(
      path.join(tempDir, "Button", "Button.tsx"),
      "utf8"
    );

    expect(componentContent).toContain(
      'import styles from "./Button.module.scss";'
    );
    expect(
      fs.existsSync(path.join(tempDir, "UserCard", "UserCard.test.tsx"))
    ).toBe(true);
  });
});
