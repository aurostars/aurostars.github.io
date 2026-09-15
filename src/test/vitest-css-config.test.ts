import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vitest CSS handling", () => {
  it("does not inject compiled Tailwind CSS into jsdom", () => {
    const config = fs.readFileSync(path.join(process.cwd(), "vitest.config.ts"), "utf8");
    expect(config).toMatch(/css:\s*false/);
  });
});
