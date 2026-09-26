"use client";

import dynamic from "next/dynamic";

function GardenFallback() {
  return (
    <div className="garden-scene" data-state="loading" aria-hidden="true">
      <div className="garden-scene-fallback">
        <span className="relief-stem relief-stem-one" />
        <span className="relief-stem relief-stem-two" />
        <span className="relief-orbit" />
      </div>
    </div>
  );
}

const GardenScene = dynamic(
  () => import("./garden-scene").then((module) => module.GardenScene),
  {
    ssr: false,
    loading: GardenFallback,
  },
);

export function GardenStage() {
  return <GardenScene />;
}
