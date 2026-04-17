"use client";

import { ScatterplotLayer } from "@deck.gl/layers";
import type { MapState, MarkerPoint } from "@/components/cv-map/types";
import { hexToRgb } from "@/components/cv-map/utils";

export function createMarkersLayer(state: MapState, markerPoints: MarkerPoint[]) {
  const markerRgb = hexToRgb(state.markerColor);

  return new ScatterplotLayer({
    id: "markers",
    data: markerPoints,
    pickable: true,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 4,
    radiusMaxPixels: 20,
    lineWidthMinPixels: 2,
    getPosition: (d: MarkerPoint) => d.position,
    getRadius: state.markerRadius,
    getFillColor: [markerRgb[0], markerRgb[1], markerRgb[2], 210],
    getLineColor: [255, 255, 255, 220],
  });
}
