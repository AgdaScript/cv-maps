"use client";

import type {
  ClusterIconPoint,
  ExpandedIconPoint,
  LayerOption,
  MapState,
  MarkerPoint,
  ScatterPoint,
} from "@/components/cv-map/types";

export type LayerControllerContext = {
  selectedLayer: LayerOption;
  state: MapState;
  zoom: number;
  markerPoints: MarkerPoint[];
  scatterPoints: ScatterPoint[];
  clusterIconPoints: ClusterIconPoint[];
  expandedIconPoints: ExpandedIconPoint[];
};
