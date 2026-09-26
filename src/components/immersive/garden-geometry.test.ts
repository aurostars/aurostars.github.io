import { describe, expect, it } from "vitest";
import { createGardenGeometries } from "./garden-geometry";

describe("createGardenGeometries", () => {
  it("builds finite original stem, leaf, petal and bird geometry", () => {
    const geometries = createGardenGeometries("desktop");

    for (const [name, geometry] of Object.entries(geometries)) {
      const position = geometry.getAttribute("position");
      expect(position.count, `${name} must contain vertices`).toBeGreaterThan(8);
      expect(
        Array.from(position.array).every(Number.isFinite),
        `${name} must contain only finite positions`,
      ).toBe(true);
      geometry.dispose();
    }
  });

  it("uses fewer vertices for the mobile scene", () => {
    const desktop = createGardenGeometries("desktop");
    const mobile = createGardenGeometries("mobile");
    const desktopVertices = Object.values(desktop).reduce(
      (sum, geometry) => sum + geometry.getAttribute("position").count,
      0,
    );
    const mobileVertices = Object.values(mobile).reduce(
      (sum, geometry) => sum + geometry.getAttribute("position").count,
      0,
    );

    expect(mobileVertices).toBeLessThan(desktopVertices);
    Object.values(desktop).forEach((geometry) => geometry.dispose());
    Object.values(mobile).forEach((geometry) => geometry.dispose());
  });
});
