"use client";

import type { Layer } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Position, RouteEndpoint } from "@/components/cv-map/types";

export function createRouteMapLayers(
  markers: RouteEndpoint[],
  path: Position[] | null
): Layer[] {
  const layers: Layer[] = [];

  // PathLayer desenha polilinhas; LineLayer só liga pares source→target (não usa getPath).
  if (path && path.length >= 2) {
    layers.push(
      new PathLayer<{ path: Position[] }>({
        id: "route-line",
        data: [{ path }],
        pickable: false,
        getPath: (d) => d.path,
        getColor: [66, 135, 245, 220],
        getWidth: 8,
        widthUnits: "pixels",
        capRounded: true,
        jointRounded: true,
      })
    );
  }

  if (markers.length > 0) {
    layers.push(
      new ScatterplotLayer<RouteEndpoint>({
        id: "route-endpoints",
        data: markers,
        pickable: true,
        stroked: true,
        filled: true,
        radiusUnits: "pixels",
        lineWidthMinPixels: 2,
        getPosition: (d) => d.position,
        getRadius: 14,
        getFillColor: (d) =>
          d.label === "A" ? [34, 197, 94, 255] : [239, 68, 68, 255],
        getLineColor: [255, 255, 255, 240],
      })
    );
  }

  return layers;
}
