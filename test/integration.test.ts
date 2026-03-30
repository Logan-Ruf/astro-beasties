import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, readFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { pathToFileURL } from "url";
import { tmpdir } from "os";
import astroBeasties from "../src/index.js";

const createFixture = async (dir: string, files: Record<string, string>) => {
  for (const [name, content] of Object.entries(files)) {
    const filePath = join(dir, name);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, content);
  }
};

describe("astro-beasties", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "astro-beasties-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true });
  });

  it("returns a valid astro integration", () => {
    const integration = astroBeasties();
    expect(integration.name).toBe("astro-beasties");
    expect(integration.hooks).toHaveProperty("astro:build:done");
  });

  it("inlines critical CSS into HTML files", async () => {
    await createFixture(tmpDir, {
      "styles.css": "h1 { color: red; } .unused { color: blue; }",
      "index.html": `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="styles.css"></head>
<body><h1>Hello</h1></body>
</html>`,
    });

    const integration = astroBeasties();
    const hook = integration.hooks["astro:build:done"]!;
    await hook({
      dir: pathToFileURL(tmpDir + "/"),
      logger: {} as any,
      routes: [],
      pages: [],
    } as any);

    const result = await readFile(join(tmpDir, "index.html"), "utf-8");
    expect(result).toContain("<style>");
    expect(result).toContain("color:red");
  });

  it("processes multiple HTML files", async () => {
    await createFixture(tmpDir, {
      "styles.css": "p { margin: 0; }",
      "index.html": `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="styles.css"></head>
<body><p>Page 1</p></body>
</html>`,
      "about/styles.css": "p { margin: 0; }",
      "about/index.html": `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="styles.css"></head>
<body><p>Page 2</p></body>
</html>`,
    });

    const integration = astroBeasties();
    const hook = integration.hooks["astro:build:done"]!;
    await hook({
      dir: pathToFileURL(tmpDir + "/"),
      logger: {} as any,
      routes: [],
      pages: [],
    } as any);

    const page1 = await readFile(join(tmpDir, "index.html"), "utf-8");
    const page2 = await readFile(join(tmpDir, "about/index.html"), "utf-8");
    expect(page1).toContain("<style>");
    expect(page2).toContain("<style>");
  });

  it("leaves HTML without stylesheets unchanged", async () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>No CSS</title></head>
<body><p>Hello</p></body>
</html>`;

    await createFixture(tmpDir, { "index.html": html });

    const integration = astroBeasties();
    const hook = integration.hooks["astro:build:done"]!;
    await hook({
      dir: pathToFileURL(tmpDir + "/"),
      logger: {} as any,
      routes: [],
      pages: [],
    } as any);

    const result = await readFile(join(tmpDir, "index.html"), "utf-8");
    expect(result).toContain("<p>Hello</p>");
  });

  it("rejects pruneSource option", async () => {
    const integration = astroBeasties({ pruneSource: true });
    const hook = integration.hooks["astro:build:done"]!;

    // Should return early without throwing
    await hook({
      dir: pathToFileURL(tmpDir + "/"),
      logger: {} as any,
      routes: [],
      pages: [],
    } as any);
  });

  it("respects the path option override", async () => {
    const subDir = join(tmpDir, "custom/");
    await createFixture(subDir, {
      "styles.css": "h1 { font-size: 2em; }",
      "index.html": `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="styles.css"></head>
<body><h1>Hello</h1></body>
</html>`,
    });

    const integration = astroBeasties({ path: subDir });
    const hook = integration.hooks["astro:build:done"]!;
    await hook({
      dir: pathToFileURL(tmpDir + "/"),
      logger: {} as any,
      routes: [],
      pages: [],
    } as any);

    const result = await readFile(join(subDir, "index.html"), "utf-8");
    expect(result).toContain("<style>");
    expect(result).toContain("font-size");
  });

  it("respects the exclude option", async () => {
    await createFixture(tmpDir, {
      "styles.css": "h1 { color: red; }",
      "index.html": `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="styles.css"></head>
<body><h1>Hello</h1></body>
</html>`,
      "admin/index.html": `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="../styles.css"></head>
<body><h1>Admin</h1></body>
</html>`,
    });

    const integration = astroBeasties({ exclude: "**/admin/**" });
    const hook = integration.hooks["astro:build:done"]!;
    await hook({
      dir: pathToFileURL(tmpDir + "/"),
      logger: {} as any,
      routes: [],
      pages: [],
    } as any);

    const main = await readFile(join(tmpDir, "index.html"), "utf-8");
    const admin = await readFile(join(tmpDir, "admin/index.html"), "utf-8");
    expect(main).toContain("<style>");
    expect(admin).not.toContain("<style>");
  });
});
