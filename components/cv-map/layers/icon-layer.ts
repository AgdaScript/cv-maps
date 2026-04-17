"use client";

import { IconLayer } from "@deck.gl/layers";
import type {
  ClusterIconPoint,
  ExpandedIconPoint,
  MapState,
} from "@/components/cv-map/types";
import { clamp } from "@/components/cv-map/utils";

export function createIconLayers(
  state: MapState,
  zoom: number,
  clusterIconPoints: ClusterIconPoint[],
  expandedIconPoints: ExpandedIconPoint[]
) {
  const isClusterMode = zoom < state.iconClusterZoom;
  const spreadFactor = clamp((zoom - (state.iconClusterZoom - 0.8)) / 2.2, 0, 1);

  if (isClusterMode) {
    return [
      new IconLayer({
        id: "icon-layer-cluster",
        data: clusterIconPoints,
        pickable: true,
        getPosition: (d: ClusterIconPoint) => d.position,
        getIcon: (d: ClusterIconPoint) => d.icon,
        sizeScale: 1,
        sizeUnits: "pixels",
        billboard: true,
        getSize: state.iconSize + 14,
      }),
    ];
  }

  return [
    new IconLayer({
      id: "icon-layer-expanded",
      data: expandedIconPoints,
      pickable: true,
      getPosition: (d: ExpandedIconPoint) => [
        d.center[0] + d.offset[0] * spreadFactor,
        d.center[1] + d.offset[1] * spreadFactor,
      ],
      getIcon: (d: ExpandedIconPoint) => d.icon,
      sizeScale: 1,
      sizeUnits: "pixels",
      billboard: true,
      getSize: Math.max(16, state.iconSize - 14 + spreadFactor * 18),
    }),
  ];
}
