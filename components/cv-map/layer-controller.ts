"use client";

import type { LayerControllerContext } from "@/components/cv-map/layers/layer-context";
import { createHexagonLayer } from "@/components/cv-map/layers/hexagon-layer";
import { createIconLayers } from "@/components/cv-map/layers/icon-layer";
import { createMarkersLayer } from "@/components/cv-map/layers/markers-layer";
import {
  createMunicipiosBordersLayer,
  createMunicipiosLayer,
} from "@/components/cv-map/layers/municipios-layer";
import { createScatterLayer } from "@/components/cv-map/layers/scatter-layer";

export function buildLayers(context: LayerControllerContext) {
  const {
    selectedLayer,
    state,
    zoom,
    hoveredMunicipioId,
    markerPoints,
    scatterPoints,
  } = context;

  switch (selectedLayer) {
    case "Municipalities":
      return [
        createMunicipiosLayer(state, hoveredMunicipioId),
        createMunicipiosBordersLayer(state),
      ];
    case "Scatterplot":
      return [createScatterLayer(state, scatterPoints)];
    case "HexagonLayer":
      return [createHexagonLayer(state, scatterPoints)];
    case "Marker points":
      return [createMarkersLayer(state, markerPoints)];
    case "IconLayer":
      return createIconLayers(
        state,
        zoom,
        context.clusterIconPoints,
        context.expandedIconPoints
      );
    default:
      return [];
  }
}
