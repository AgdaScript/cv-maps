"use client";

import { GeoJsonLayer } from "@deck.gl/layers";
import { caboverde } from "@/lib/caboverde";
import type { MapState } from "@/components/cv-map/types";
import { hexToRgb } from "@/components/cv-map/utils";

export function createMunicipiosLayer(state: MapState) {
  const municipalityRgb = hexToRgb(state.municipalityColor);

  return new GeoJsonLayer({
    id: "municipios",
    data: caboverde as any,
    stroked: true,
    filled: true,
    pickable: true,
    lineWidthMinPixels: state.municipalityLineWidth,
    getLineColor: [235, 235, 235, 230],
    getFillColor: [
      municipalityRgb[0],
      municipalityRgb[1],
      municipalityRgb[2],
      Math.round((state.municipalityOpacity / 100) * 255),
    ],
  });
}
