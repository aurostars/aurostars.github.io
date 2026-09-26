import * as THREE from "three";

export type GardenDetail = "desktop" | "mobile";

function createStem(detail: GardenDetail) {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.8, -2.4, 0),
    new THREE.Vector3(-2.4, -0.9, 0.25),
    new THREE.Vector3(-1.1, 0.25, -0.1),
    new THREE.Vector3(0.7, 1.1, 0.22),
    new THREE.Vector3(2.7, 2.25, -0.05),
  ]);
  return new THREE.TubeGeometry(
    path,
    detail === "desktop" ? 96 : 48,
    0.085,
    detail === "desktop" ? 14 : 8,
    false,
  );
}

function createLeaf(detail: GardenDetail) {
  const geometry = new THREE.SphereGeometry(
    1,
    detail === "desktop" ? 28 : 16,
    detail === "desktop" ? 18 : 10,
  );
  geometry.scale(0.42, 1.05, 0.12);
  geometry.rotateZ(-0.42);
  return geometry;
}

function createPetal(detail: GardenDetail) {
  const geometry = new THREE.SphereGeometry(
    1,
    detail === "desktop" ? 24 : 14,
    detail === "desktop" ? 16 : 9,
  );
  geometry.scale(0.38, 0.92, 0.11);
  geometry.translate(0, 0.67, 0);
  return geometry;
}

function createBird() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.5, 0);
  shape.bezierCurveTo(-0.85, 0.05, -0.42, 0.72, 0, 0.24);
  shape.bezierCurveTo(0.42, 0.72, 0.85, 0.05, 1.5, 0);
  shape.bezierCurveTo(0.78, -0.2, 0.38, 0.08, 0, -0.12);
  shape.bezierCurveTo(-0.38, 0.08, -0.78, -0.2, -1.5, 0);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 10,
  });
}

export function createGardenGeometries(detail: GardenDetail) {
  return {
    stem: createStem(detail),
    leaf: createLeaf(detail),
    petal: createPetal(detail),
    bird: createBird(),
  };
}
