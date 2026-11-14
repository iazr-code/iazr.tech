import { describe, expect, it } from "vitest";

import { certificationCount, certifications, diplomas } from "@/lib/data/experience";

describe("certifications", () => {
  it("lists the 15 international certifications from the CV", () => {
    expect(certificationCount).toBe(15);
    expect(certifications.map((g) => g.credentials.length)).toEqual([8, 4, 3]);
  });

  it("gives every Coursera certificate a public verification link", () => {
    const coursera = certifications.find((g) => g.id === "coursera-2025");
    expect(coursera?.credentials).toHaveLength(8);
    for (const c of coursera?.credentials ?? []) {
      expect(c.verifyUrl).toMatch(/^https:\/\/coursera\.org\/verify\/professional-cert\/[A-Z0-9]{12}$/);
    }
  });

  it("has no duplicated credential names", () => {
    const names = certifications.flatMap((g) => g.credentials.map((c) => c.name));
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps the three executive diplomas", () => {
    expect(diplomas).toHaveLength(3);
  });
});
