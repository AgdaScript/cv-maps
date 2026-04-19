"use client";

import type {
  ClusterIconPoint,
  ExpandedIconPoint,
  LayerOption,
  MapState,
  MarkerPoint,
  Position,
  RouteEndpoint,
  ScatterPoint,
} from "@/components/cv-map/types";

export type LayerControllerContext = {
  selectedLayer: LayerOption;
  state: MapState;
  zoom: number;
  hoveredMunicipioId: string | null;
  markerPoints: MarkerPoint[];
  scatterPoints: ScatterPoint[];
  clusterIconPoints: ClusterIconPoint[];
  expandedIconPoints: ExpandedIconPoint[];
  routeMarkers: RouteEndpoint[];
  routePath: Position[] | null;
};
