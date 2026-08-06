const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  initializeProject,
  loadProjectConfig,
  loadCustomTemplate
} = require("../index");

describe("project initialization", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cnrc-init-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates config and JavaScript and TypeScript starter templates", () => {
    const result = initializeProject(tempDir);

    expect(result.created).toEqual([
      path.join(".cnrc", "config.json"),
      path.join(".cnrc", "templates", "component.jsx"),
      path.join(".cnrc", "templates", "component.tsx")
    ]);
    expect(result.skipped).toEqual([]);
    expect(loadProjectConfig(tempDir)).toEqual({
      lang: "js",
      style: "css",
      componentType: "functional",
      baseDir: "src/components"
    });

    ["component.jsx", "component.tsx"].forEach((fileName) => {
      const templatePath = path.join(tempDir, ".cnrc", "templates", fileName);
      expect(() => loadCustomTemplate(templatePath)).not.toThrow();
    });
  });

  it("preserves every existing init file", () => {
    const configPath = path.join(tempDir, ".cnrc", "config.json");
    const jsTemplatePath = path.join(tempDir, ".cnrc", "templates", "component.jsx");
    fs.mkdirSync(path.dirname(jsTemplatePath), { recursive: true });
    fs.writeFileSync(configPath, '{"lang":"ts"}\n');
    fs.writeFileSync(jsTemplatePath, "custom template\n");

    const result = initializeProject(tempDir);

    expect(result.skipped).toEqual([
      path.join(".cnrc", "config.json"),
      path.join(".cnrc", "templates", "component.jsx")
    ]);
    expect(fs.readFileSync(configPath, "utf8")).toBe('{"lang":"ts"}\n');
    expect(fs.readFileSync(jsTemplatePath, "utf8")).toBe("custom template\n");
    expect(fs.existsSync(path.join(tempDir, ".cnrc", "templates", "component.tsx"))).toBe(true);
  });

  it("lets .cnrc/config.json override legacy .cnrc.json fields", () => {
    fs.writeFileSync(
      path.join(tempDir, ".cnrc.json"),
      JSON.stringify({ lang: "ts", style: "scss", withTest: true })
    );
    fs.mkdirSync(path.join(tempDir, ".cnrc"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, ".cnrc", "config.json"),
      JSON.stringify({ lang: "js", withStory: true })
    );

    expect(loadProjectConfig(tempDir)).toEqual({
      lang: "js",
      style: "scss",
      withTest: true,
      withStory: true
    });
  });
});
