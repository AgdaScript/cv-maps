"use client";

import type { Layer } from "@deck.gl/core";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import type { IconDefinition, Position, RouteEndpoint } from "@/components/cv-map/types";
import { createPinIconDataUrl } from "@/components/cv-map/utils";

type RoutePinDatum = RouteEndpoint & { icon: IconDefinition };

function routePinIcon(label: "A" | "B"): IconDefinition {
  const color = label === "A" ? "#22c55e" : "#ef4444";
  return {
    id: `route-pin-${label}-${color}`,
    url: createPinIconDataUrl(color),
    width: 80,
    height: 80,
    anchorY: 72,
  };
}

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
    const data: RoutePinDatum[] = markers.map((m) => ({
      ...m,
      icon: routePinIcon(m.label),
    }));

    layers.push(
      new IconLayer<RoutePinDatum>({
        id: "route-endpoints",
        data,
        pickable: true,
        getPosition: (d) => d.position,
        getIcon: (d) => d.icon,
        sizeScale: 1,
        sizeUnits: "pixels",
        billboard: true,
        getSize: 48,
      })
    );
  }

  return layers;
}
