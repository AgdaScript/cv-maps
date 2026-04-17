"use client";

import type { LayerControllerContext } from "@/components/cv-map/layers/layer-context";
import { createHexagonLayer } from "@/components/cv-map/layers/hexagon-layer";
import { createIconLayers } from "@/components/cv-map/layers/icon-layer";
import { createLabelsLayer } from "@/components/cv-map/layers/labels-layer";
import { createMarkersLayer } from "@/components/cv-map/layers/markers-layer";
import { createMunicipiosLayer } from "@/components/cv-map/layers/municipios-layer";
import { createScatterLayer } from "@/components/cv-map/layers/scatter-layer";

export function buildLayers(context: LayerControllerContext) {
  const { selectedLayer, state, zoom, markerPoints, scatterPoints } = context;

  switch (selectedLayer) {
    case "Municipios":
      return [createMunicipiosLayer(state)];
    case "Scatterplot":
      return [createScatterLayer(state, scatterPoints)];
    case "HexagonLayer":
      return [createHexagonLayer(state, scatterPoints)];
    case "Marker points":
      return [createMarkersLayer(state, markerPoints)];
    case "Labels de municipios":
      return [createLabelsLayer(state, markerPoints)];
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
