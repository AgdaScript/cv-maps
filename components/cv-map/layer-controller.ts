"use client";

import type { LayerControllerContext } from "@/components/cv-map/layers/layer-context";
import { createHexagonLayer } from "@/components/cv-map/layers/hexagon-layer";
import { createIconLayers } from "@/components/cv-map/layers/icon-layer";
import {
  createMunicipiosBordersLayer,
  createMunicipiosLayer,
} from "@/components/cv-map/layers/municipios-layer";
import { createRouteMapLayers } from "@/components/cv-map/layers/route-map-layers";
import { createScatterLayer } from "@/components/cv-map/layers/scatter-layer";

export function buildLayers(context: LayerControllerContext) {
  const {
    selectedLayer,
    state,
    zoom,
    hoveredMunicipioId,
    scatterPoints,
    routeMarkers,
    routePath,
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
    case "Route Map":
      return createRouteMapLayers(routeMarkers, routePath);
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
