"use client";

import type { LayerOption } from "@/components/cv-map/types";
import trafficAccidentsScatter from "@/data/traffic-accidents-scatter.json";

export const TRAFFIC_ACCIDENTS_SCATTER_MAX = (
  trafficAccidentsScatter as { id: string }[]
).length;

export const MAP_STYLES = {
  Dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  Light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  Voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
} as const;

export type MapStyleName = keyof typeof MAP_STYLES;

export const HEXAGON_COLOR_RANGE: [number, number, number][] = [
  [20, 184, 166],
  [34, 197, 94],
  [132, 204, 22],
  [250, 204, 21],
  [251, 146, 60],
  [249, 115, 22],
  [239, 68, 68],
];

export const INITIAL_VIEW_STATE = {
  longitude: -24,
  latitude: 15.95,
  zoom: 7.5,
  minZoom: 7.5,
  maxZoom: 13,
  pitch: 15,
  bearing: 0,
};

export const LAYER_OPTIONS: LayerOption[] = [
  "Municipalities",
  "Scatterplot",
  "Route Map",
  // "Marker points",
  "HexagonLayer",
  "IconLayer",
];

/** Título e subtítulo do mapa (canto superior esquerdo), alinhados ao modo Municipalities. */
export const LAYER_MAP_HEADERS: Record<
  LayerOption,
  { title: string; subtitle: string }
> = {
  Municipalities: {
    title: "Cabo Verde Census Data",
    subtitle: "Distribution of competitors by municipality",
  },
  Scatterplot: {
    title: "Cabo Verde Traffic Accidents",
    subtitle: "Distribution of incidents by location",
  },
  "Route Map": {
    title: "Route Map",
    subtitle: "Driving directions on the road network between two map pins",
  },
  HexagonLayer: {
    title: "Hexagon layer",
    subtitle: "Accident points aggregated into colored hexagonal cells",
  },
  IconLayer: {
    title: "Icon layer",
    subtitle: "Custom markers per municipality — cluster or expanded by zoom",
  },
};
