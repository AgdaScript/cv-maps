"use client";

import { ScatterplotLayer } from "@deck.gl/layers";
import type { MapState, ScatterPoint } from "@/components/cv-map/types";
import { hexToRgb } from "@/components/cv-map/utils";

const SCATTER_DEFAULTS = {
  scatterColorMale: "#2563eb",
  scatterColorFemale: "#ec4899",
  scatterBorderColor: "#ffffff",
} as const;

export function createScatterLayer(state: MapState, scatterPoints: ScatterPoint[]) {
  const maleRgb = hexToRgb(state.scatterColorMale ?? SCATTER_DEFAULTS.scatterColorMale);
  const femaleRgb = hexToRgb(state.scatterColorFemale ?? SCATTER_DEFAULTS.scatterColorFemale);
  const borderRgb = hexToRgb(state.scatterBorderColor ?? SCATTER_DEFAULTS.scatterBorderColor);

  const borderVisible = !(state.scatterBorderInvisible ?? false);

  return new ScatterplotLayer({
    id: "scatter",
    data: scatterPoints,
    pickable: true,
    stroked: borderVisible,
    filled: true,
    lineWidthMinPixels: borderVisible ? 1 : 0,
    radiusScale: 1,
    radiusMinPixels: 2,
    getPosition: (d: ScatterPoint) => d.position,
    getRadius: (d: ScatterPoint) => (d.value / 100) * state.scatterRadius,
    getFillColor: (d: ScatterPoint) => {
      const alpha = Math.round((state.scatterOpacity / 100) * 255);
      const [r, g, b] = d.sex === "Homem" ? maleRgb : femaleRgb;
      return [r, g, b, alpha];
    },
    getLineColor: [...borderRgb, borderVisible ? 200 : 0],
    updateTriggers: {
      getRadius: [state.scatterRadius],
      getFillColor: [
        state.scatterOpacity,
        state.scatterColorMale,
        state.scatterColorFemale,
      ],
      getLineColor: [state.scatterBorderColor, state.scatterBorderInvisible],
    },
  });
}
