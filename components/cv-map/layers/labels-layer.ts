"use client";

import { TextLayer } from "@deck.gl/layers";
import type { MapState, MarkerPoint } from "@/components/cv-map/types";
import { hexToRgb } from "@/components/cv-map/utils";

export function createLabelsLayer(state: MapState, markerPoints: MarkerPoint[]) {
  const labelsRgb = hexToRgb(state.labelColor);

  return new TextLayer({
    id: "municipality-labels",
    data: markerPoints,
    pickable: false,
    getPosition: (d: MarkerPoint) => d.position,
    getText: (d: MarkerPoint) => d.name,
    getColor: [labelsRgb[0], labelsRgb[1], labelsRgb[2], 255],
    getSize: state.labelSize,
    getTextAnchor: "middle",
    getAlignmentBaseline: "bottom",
    getPixelOffset: [0, -state.labelOffset],
  });
}
