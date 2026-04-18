"use client";

export type Position = [number, number];

export type LayerOption =
  | "Municipios"
  | "Scatterplot"
  | "Marker points"
  | "HexagonLayer"
  | "IconLayer";

export type MarkerPoint = {
  name: string;
  position: Position;
};

export type ScatterPoint = {
  municipality: string;
  value: number;
  position: Position;
};

export type IconDefinition = {
  id: string;
  url: string;
  width: number;
  height: number;
  anchorY: number;
};

export type ClusterIconPoint = {
  name: string;
  position: Position;
  count: number;
  icon: IconDefinition;
};

export type ExpandedIconPoint = {
  name: string;
  municipality: string;
  center: Position;
  offset: Position;
  icon: IconDefinition;
};

export type MapState = {
  municipalityOpacity: number;
  municipalityLineWidth: number;
  municipalityColor: string;
  municipioBorderSameAsFill: boolean;
  municipioBorderInvisible: boolean;
  municipioBorderColor: string;
  municipioValueMinFilter: number;
  municipioValueMaxFilter: number;
  scatterCount: number;
  scatterRadius: number;
  scatterOpacity: number;
  scatterColor: string;
  hexagonRadius: number;
  hexagonCoverage: number;
  hexagonUpperPercentile: number;
  hexagonElevationScale: number;
  hexagonExtruded: boolean;
  markerRadius: number;
  markerColor: string;
  iconSize: number;
  iconColor: string;
  iconPointsPerMunicipality: number;
  iconClusterZoom: number;
};
