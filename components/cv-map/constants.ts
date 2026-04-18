"use client";

import type { LayerOption } from "@/components/cv-map/types";

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
  "Marker points",
  "HexagonLayer",
  "IconLayer",
];
