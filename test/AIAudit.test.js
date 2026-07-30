const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const {
  DEFAULT_MODEL,
  MAX_FILES,
  collectAuditContext,
  formatAuditReport,
  requestAuditReport,
  runAiAudit,
  validateAuditReport
} = require("../AIAudit");
const { parseAuditArguments, runAuditCommand } = require("../index");

function sampleReport() {
  return {
    summary: "The component system has three review candidates.",
    findings: [
      {
        title: "Merge duplicate cards",
        verdict: "merge",
        confidence: "high",
        impact: "high",
        effort: "medium",
        riskLevel: "medium",
        rationale: "They serve the same product role.",
        evidence: [
          {
            file: "src/components/Card.tsx",
            lineStart: 2,
            lineEnd: 4,
            observation: "Same public API."
          },
          {
            file: "src/components/Card.tsx",
            lineStart: 8,
            lineEnd: 8,
            observation: "Used interchangeably."
          },
          {
            file: "src/components/Card.tsx",
            lineStart: 12,
            lineEnd: 13,
            observation: "Another caller."
          }
        ],
        proposedApi: "Card with a variant prop",
        affectedCallers: ["src/Page.tsx"],
        migrationSteps: ["Introduce Card."],
        risks: ["Visual regression."]
      },
      {
        title: "Extract a primitive",
        verdict: "shared-primitive",
        confidence: "medium",
        impact: "high",
        effort: "high",
        riskLevel: "medium",
        rationale: "Behavior differs but layout infrastructure is shared.",
        evidence: [
          {
            file: "src/components/Card.tsx",
            lineStart: 5,
            lineEnd: 9,
            observation: "Shared shell."
          }
        ],
        proposedApi: "PanelFrame",
        affectedCallers: [],
        migrationSteps: ["Extract the shell."],
        risks: []
      },
      {
        title: "Keep domain cards separate",
        verdict: "keep-separate",
        confidence: "high",
        impact: "medium",
        effort: "low",
        riskLevel: "low",
        rationale: "Their business responsibilities differ.",
        evidence: [
          {
            file: "src/components/Card.tsx",
            lineStart: 6,
            lineEnd: 7,
            observation: "Owns billing state."
          }
        ],
        proposedApi: "No change",
        affectedCallers: [],
        migrationSteps: ["Document the distinction."],
        risks: []
      },
      {
        title: "Fourth lower-priority finding",
        verdict: "merge",
        confidence: "low",
        impact: "low",
        effort: "medium",
        riskLevel: "medium",
        rationale: "This should be hidden in concise output.",
        evidence: [
          {
            file: "src/components/Card.tsx",
            lineStart: 1,
            lineEnd: 1,
            observation: "Low-value duplication."
          }
        ],
        proposedApi: "LowValue",
        affectedCallers: [],
        migrationSteps: ["4. Consider this later."],
        risks: ["Low return on effort."]
      }
    ],
    recommendedOrder: [
      "1. Merge duplicate cards first.",
      "2) Extract the shared primitive.",
      "- Document intentional separation."
    ]
  };
}

function successfulFetch(report = sampleReport()) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(report) }]
        }
      ]
    })
  });
}

describe("AI audit", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-audit-test-"));
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "fixture" })
    );
    fs.mkdirSync(path.join(tempDir, "src", "components"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "src", "components", "Card.tsx"),
      [
        "export default function Card() {",
        "  return (",
        "    <article>",
        "      <h2>Card</h2>",
        "    </article>",
        "  );",
        "}",
        "",
        "// fixture line 9",
        "// fixture line 10",
        "// fixture line 11",
        "// fixture line 12",
        "// fixture line 13"
      ].join("\n")
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("uses the AI model for a structured read-only report", async () => {
    const fetchImpl = successfulFetch();
    const result = await runAiAudit({
      apiKey: "test-key",
      directory: path.join(tempDir, "src", "components"),
      fetchImpl
    });
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body);

    expect(request.model).toBe(DEFAULT_MODEL);
    expect(request.reasoning).toEqual({ effort: "medium" });
    expect(request.store).toBe(false);
    expect(request.text.format.type).toBe("json_schema");
    expect(result.report.findings.map((finding) => finding.verdict)).toEqual([
      "merge",
      "shared-primitive",
      "keep-separate",
      "merge"
    ]);
    expect(request.input).toContain("1|export default function Card");
    expect(request.input).toContain("Prioritize findings by material product");
    expect(request.input).toContain("low-value deduplication");
    expect(request.input).toContain("without leading numbers");
  });

  it("checks the API key before reading the target directory", async () => {
    const fetchImpl = jest.fn();

    await expect(
      runAiAudit({
        apiKey: "",
        directory: "/does/not/exist",
        fetchImpl
      })
    ).rejects.toThrow("OPENAI_API_KEY is required");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("collects target files, project metadata, and related callers only", () => {
    fs.writeFileSync(
      path.join(tempDir, ".cnrc.json"),
      JSON.stringify({ lang: "ts" })
    );
    fs.writeFileSync(
      path.join(tempDir, "src", "Page.tsx"),
      "import Card from './components/Card'; export default () => <Card />;"
    );
    fs.writeFileSync(
      path.join(tempDir, "src", "Unrelated.tsx"),
      "export default () => <main />;"
    );
    fs.mkdirSync(path.join(tempDir, "dist"));
    fs.writeFileSync(path.join(tempDir, "dist", "Card.tsx"), "ignored");

    const context = collectAuditContext(
      path.join(tempDir, "src", "components")
    );
    const paths = context.files.map((file) => file.path);

    expect(paths).toEqual([
      ".cnrc.json",
      "package.json",
      "src/Page.tsx",
      "src/components/Card.tsx"
    ]);
    expect(paths).not.toContain("src/Unrelated.tsx");
    expect(paths).not.toContain("dist/Card.tsx");
  });

  it("rejects context above the file limit", () => {
    const componentsDir = path.join(tempDir, "src", "components");
    for (let index = 0; index < MAX_FILES; index += 1) {
      fs.writeFileSync(
        path.join(componentsDir, `Extra${index}.tsx`),
        `export default () => <div>${index}</div>;`
      );
    }

    expect(() => collectAuditContext(componentsDir)).toThrow(
      "Audit context is too large"
    );
  });

  it.each([
    [401, "OpenAI rejected OPENAI_API_KEY"],
    [429, "rate limit or quota exceeded"],
    [500, "OpenAI service error"]
  ])("returns an actionable error for HTTP %s", async (status, message) => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ error: { message: "API detail" } })
    });

    await expect(
      requestAuditReport({
        apiKey: "test-key",
        context: collectAuditContext(path.join(tempDir, "src", "components")),
        fetchImpl
      })
    ).rejects.toThrow(message);
  });

  it("handles timeouts, refusals, invalid JSON, and incomplete reports", async () => {
    const context = collectAuditContext(path.join(tempDir, "src", "components"));
    const timeoutFetch = jest.fn((url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      })
    );

    await expect(
      requestAuditReport({
        apiKey: "test-key",
        context,
        fetchImpl: timeoutFetch,
        timeoutMs: 1
      })
    ).rejects.toThrow("timed out");

    const responseWith = (content) =>
      jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ output: [{ content: [content] }] })
      });

    await expect(
      requestAuditReport({
        apiKey: "test-key",
        context,
        fetchImpl: responseWith({ type: "refusal", refusal: "Cannot comply" })
      })
    ).rejects.toThrow("refused");
    await expect(
      requestAuditReport({
        apiKey: "test-key",
        context,
        fetchImpl: responseWith({ type: "output_text", text: "not json" })
      })
    ).rejects.toThrow("invalid JSON");
    expect(() => validateAuditReport({ summary: "x", findings: [] })).toThrow(
      "incomplete audit report"
    );

    const invalidEvidence = sampleReport();
    invalidEvidence.findings[0].evidence[0].lineEnd = 999;
    expect(() => validateAuditReport(invalidEvidence, context)).toThrow(
      "invalid audit evidence"
    );
  });

  it("parses model overrides and prints JSON through the CLI handler", async () => {
    const options = parseAuditArguments([
      path.join(tempDir, "src", "components"),
      "--json",
      "--detail",
      "full",
      "--model",
      "gpt-5.6-sol"
    ]);
    expect(options.model).toBe("gpt-5.6-sol");
    expect(options.json).toBe(true);
    expect(options.detail).toBe("full");

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    await runAuditCommand(
      [path.join(tempDir, "src", "components"), "--json"],
      {
        apiKey: "test-key",
        fetchImpl: successfulFetch(),
        onContextReady: () => {}
      }
    );
    expect(JSON.parse(consoleSpy.mock.calls[0][0]).summary).toContain(
      "review candidates"
    );
  });

  it("formats concise and full terminal reports", () => {
    const result = {
      report: sampleReport(),
      context: { files: [{}, {}], totalBytes: 123 },
      model: DEFAULT_MODEL
    };
    const concise = formatAuditReport(result);
    const full = formatAuditReport(result, "full");

    expect(concise).toContain("Impact: high | Effort: medium | Risk: medium");
    expect(concise).toContain("src/components/Card.tsx:2-4");
    expect(concise).toContain("src/components/Card.tsx:8");
    expect(concise).not.toContain("src/components/Card.tsx:12-13");
    expect(concise).not.toContain("Fourth lower-priority finding");
    expect(concise).not.toContain("Proposed API:");
    expect(concise).toContain("Showing 3 of 4 findings");
    expect(concise).toContain("1. Merge duplicate cards first.");
    expect(concise).not.toContain("1. 1.");

    expect(full).toContain("Fourth lower-priority finding");
    expect(full).toContain("src/components/Card.tsx:12-13");
    expect(full).toContain("Proposed API: Card with a variant prop");
    expect(full).toContain("Affected callers: src/Page.tsx");
    expect(full).toContain("Step: Introduce Card.");
    expect(full).toContain("Risk: Visual regression.");
  });

  it("rejects invalid detail before reading files or calling OpenAI", async () => {
    const fetchImpl = jest.fn();

    await expect(
      runAuditCommand(["/does/not/exist", "--detail", "verbose"], {
        apiKey: "test-key",
        fetchImpl
      })
    ).rejects.toThrow("--detail must be one of: concise, full");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("runs the real CLI against a fixture with a mocked OpenAI response", () => {
    const mockFetchPath = path.join(tempDir, "mock-fetch.js");
    fs.writeFileSync(
      mockFetchPath,
      `global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => (${JSON.stringify({
          status: "completed",
          output_text: JSON.stringify(sampleReport())
        })})
      });`
    );
    const cliPath = path.resolve(__dirname, "..", "index.js");
    const output = execFileSync(
      process.execPath,
      [
        "--require",
        mockFetchPath,
        cliPath,
        "audit",
        path.join(tempDir, "src", "components"),
        "--json"
      ],
      {
        encoding: "utf8",
        env: { ...process.env, OPENAI_API_KEY: "test-key" }
      }
    );

    expect(JSON.parse(output).findings).toHaveLength(4);
  });
});
