import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("smoke", () => {
  it("resolves the @/ alias and merges classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
