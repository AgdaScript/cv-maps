"use client";

import { ScatterplotLayer } from "@deck.gl/layers";
import type { MapState, ScatterPoint } from "@/components/cv-map/types";
import { hexToRgb } from "@/components/cv-map/utils";

export function createScatterLayer(state: MapState, scatterPoints: ScatterPoint[]) {
  const scatterRgb = hexToRgb(state.scatterColor);

  return new ScatterplotLayer({
    id: "scatter",
    data: scatterPoints,
    pickable: true,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    radiusScale: 1,
    radiusMinPixels: 2,
    getPosition: (d: ScatterPoint) => d.position,
    getRadius: (d: ScatterPoint) => (d.value / 100) * state.scatterRadius,
    getFillColor: [
      scatterRgb[0],
      scatterRgb[1],
      scatterRgb[2],
      Math.round((state.scatterOpacity / 100) * 255),
    ],
    getLineColor: [255, 255, 255, 160],
  });
}
