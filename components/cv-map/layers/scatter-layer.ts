"use client";

import { ScatterplotLayer } from "@deck.gl/layers";
import type { MapState, ScatterPoint } from "@/components/cv-map/types";

export function createScatterLayer(state: MapState, scatterPoints: ScatterPoint[]) {
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
    getFillColor: (d: ScatterPoint) => {
      const alpha = Math.round((state.scatterOpacity / 100) * 255);
      if (d.sex === "Homem") {
        return [37, 99, 235, alpha];
      }
      return [236, 72, 153, alpha];
    },
    getLineColor: [255, 255, 255, 160],
    updateTriggers: {
      getRadius: [state.scatterRadius],
      getFillColor: [state.scatterOpacity],
    },
  });
}
