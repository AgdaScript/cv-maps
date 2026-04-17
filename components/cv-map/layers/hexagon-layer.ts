"use client";

import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { HEXAGON_COLOR_RANGE } from "@/components/cv-map/constants";
import type { MapState, ScatterPoint } from "@/components/cv-map/types";

export function createHexagonLayer(state: MapState, scatterPoints: ScatterPoint[]) {
  return new HexagonLayer<ScatterPoint>({
    id: "hexagon-layer",
    data: scatterPoints,
    pickable: true,
    extruded: state.hexagonExtruded,
    radius: state.hexagonRadius,
    coverage: state.hexagonCoverage,
    upperPercentile: state.hexagonUpperPercentile,
    elevationScale: state.hexagonElevationScale,
    colorRange: HEXAGON_COLOR_RANGE,
    getPosition: (d: ScatterPoint) => d.position,
  });
}
