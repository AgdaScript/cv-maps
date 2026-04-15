"use client";

import { useMemo, useState } from "react";
import type { PickingInfo } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import Map from "react-map-gl/maplibre";
import { caboverde } from "@/lib/caboverde";

type Position = [number, number];

type MunicipalityFeature = (typeof caboverde.features)[number];

type MarkerPoint = {
  name: string;
  position: Position;
};

type ScatterPoint = {
  municipality: string;
  value: number;
  position: Position;
};

const MAP_STYLES = {
  Escuro: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  Claro: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  Voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
};

const INITIAL_VIEW_STATE = {
  longitude: -23.6,
  latitude: 15.95,
  zoom: 6.3,
  minZoom: 5.3,
  maxZoom: 13,
  pitch: 15,
  bearing: 0,
};

function flattenCoordinates(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  if (value.length === 0) return [];

  if (
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  ) {
    return [value as number[]];
  }

  return value.flatMap((child) => flattenCoordinates(child));
}

function municipalityCenter(feature: MunicipalityFeature): Position {
  const coords = flattenCoordinates(feature.geometry.coordinates);
  const total = coords.length || 1;
  let lng = 0;
  let lat = 0;

  for (const coord of coords) {
    lng += coord[0] ?? 0;
    lat += coord[1] ?? 0;
  }

  return [lng / total, lat / total];
}

function hashToUnit(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return (hash % 1000) / 1000;
}

function generateScatterPoints(
  features: MunicipalityFeature[],
  pointsPerMunicipality: number
): ScatterPoint[] {
  const points: ScatterPoint[] = [];

  for (const feature of features) {
    const center = municipalityCenter(feature);
    const name = feature.properties.NAME_1;

    for (let i = 0; i < pointsPerMunicipality; i += 1) {
      const seed = `${name}-${i}`;
      const lngOffset = (hashToUnit(`${seed}-lng`) - 0.5) * 0.35;
      const latOffset = (hashToUnit(`${seed}-lat`) - 0.5) * 0.24;
      const value = 20 + Math.round(hashToUnit(`${seed}-val`) * 80);

      points.push({
        municipality: name,
        value,
        position: [center[0] + lngOffset, center[1] + latOffset],
      });
    }
  }

  return points;
}

function hexToRgb(hex: string): [number, number, number] {
  const parsed = hex.replace("#", "");
  const normalized =
    parsed.length === 3
      ? `${parsed[0]}${parsed[0]}${parsed[1]}${parsed[1]}${parsed[2]}${parsed[2]}`
      : parsed;
  const int = Number.parseInt(normalized, 16);

  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export default function HomePage() {
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>("Escuro");
  const [showMunicipalities, setShowMunicipalities] = useState(true);
  const [showScatter, setShowScatter] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const [municipalityOpacity, setMunicipalityOpacity] = useState(45);
  const [municipalityLineWidth, setMunicipalityLineWidth] = useState(2);
  const [municipalityColor, setMunicipalityColor] = useState("#22d3ee");

  const [scatterCount, setScatterCount] = useState(8);
  const [scatterRadius, setScatterRadius] = useState(1200);
  const [scatterOpacity, setScatterOpacity] = useState(65);
  const [scatterColor, setScatterColor] = useState("#84cc16");

  const [markerRadius, setMarkerRadius] = useState(2600);
  const [markerColor, setMarkerColor] = useState("#f97316");

  const markerPoints = useMemo<MarkerPoint[]>(() => {
    return caboverde.features.map((feature) => ({
      name: feature.properties.NAME_1,
      position: municipalityCenter(feature),
    }));
  }, []);

  const scatterPoints = useMemo<ScatterPoint[]>(() => {
    return generateScatterPoints(caboverde.features, scatterCount);
  }, [scatterCount]);

  const layers = useMemo(() => {
    const municipalityRgb = hexToRgb(municipalityColor);
    const scatterRgb = hexToRgb(scatterColor);
    const markerRgb = hexToRgb(markerColor);
    const computedLayers = [];

    if (showMunicipalities) {
      computedLayers.push(
        new GeoJsonLayer({
          id: "municipios",
          data: caboverde,
          stroked: true,
          filled: true,
          pickable: true,
          lineWidthMinPixels: municipalityLineWidth,
          getLineColor: [235, 235, 235, 230],
          getFillColor: [
            municipalityRgb[0],
            municipalityRgb[1],
            municipalityRgb[2],
            Math.round((municipalityOpacity / 100) * 255),
          ],
        })
      );
    }

    if (showScatter) {
      computedLayers.push(
        new ScatterplotLayer({
          id: "scatter",
          data: scatterPoints,
          pickable: true,
          stroked: true,
          filled: true,
          lineWidthMinPixels: 1,
          radiusScale: 1,
          radiusMinPixels: 2,
          getPosition: (d: ScatterPoint) => d.position,
          getRadius: (d: ScatterPoint) => (d.value / 100) * scatterRadius,
          getFillColor: [
            scatterRgb[0],
            scatterRgb[1],
            scatterRgb[2],
            Math.round((scatterOpacity / 100) * 255),
          ],
          getLineColor: [255, 255, 255, 160],
        })
      );
    }

    if (showMarkers) {
      computedLayers.push(
        new ScatterplotLayer({
          id: "markers",
          data: markerPoints,
          pickable: true,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 4,
          radiusMaxPixels: 20,
          lineWidthMinPixels: 2,
          getPosition: (d: MarkerPoint) => d.position,
          getRadius: markerRadius,
          getFillColor: [markerRgb[0], markerRgb[1], markerRgb[2], 210],
          getLineColor: [255, 255, 255, 220],
        })
      );
    }

    if (showLabels) {
      computedLayers.push(
        new TextLayer({
          id: "municipality-labels",
          data: markerPoints,
          pickable: false,
          getPosition: (d: MarkerPoint) => d.position,
          getText: (d: MarkerPoint) => d.name,
          getColor: [255, 255, 255, 255],
          getSize: 12,
          getTextAnchor: "middle",
          getAlignmentBaseline: "bottom",
          getPixelOffset: [0, -8],
        })
      );
    }

    return computedLayers;
  }, [
    markerColor,
    markerPoints,
    markerRadius,
    municipalityColor,
    municipalityLineWidth,
    municipalityOpacity,
    scatterColor,
    scatterOpacity,
    scatterPoints,
    scatterRadius,
    showLabels,
    showMarkers,
    showMunicipalities,
    showScatter,
  ]);

  const getTooltip = (info: PickingInfo<ScatterPoint | MarkerPoint>) => {
    const object = info.object;
    if (!object) return null;

    if ("municipality" in object) {
      return `Scatter\nMunicipio: ${object.municipality}\nValor: ${object.value}`;
    }

    if ("name" in object) {
      return `Marker\nMunicipio: ${object.name}`;
    }

    return null;
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[360px_1fr]">
        <aside className="z-10 overflow-y-auto border-r border-border bg-card p-4">
          <h1 className="text-xl font-semibold">CV Map Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deck.gl com municipios, scatterplot e marker points configuraveis.
          </p>

          <section className="mt-4 space-y-2 rounded-md border border-border p-3">
            <h2 className="font-medium">Mapa Base</h2>
            <label className="text-sm">Estilo</label>
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
              value={mapStyle}
              onChange={(event) =>
                setMapStyle(event.target.value as keyof typeof MAP_STYLES)
              }
            >
              {Object.keys(MAP_STYLES).map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </section>

          <section className="mt-4 space-y-3 rounded-md border border-border p-3">
            <h2 className="font-medium">Camadas</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showMunicipalities}
                onChange={(event) => setShowMunicipalities(event.target.checked)}
              />
              Municipios
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showScatter}
                onChange={(event) => setShowScatter(event.target.checked)}
              />
              Scatterplot
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={(event) => setShowMarkers(event.target.checked)}
              />
              Marker points
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(event) => setShowLabels(event.target.checked)}
              />
              Labels de municipios
            </label>
          </section>

          <section className="mt-4 space-y-3 rounded-md border border-border p-3">
            <h2 className="font-medium">Municipios</h2>
            <label className="block text-sm">
              Opacidade: {municipalityOpacity}%
            </label>
            <input
              className="w-full"
              type="range"
              min={0}
              max={100}
              value={municipalityOpacity}
              onChange={(event) =>
                setMunicipalityOpacity(Number(event.target.value))
              }
            />
            <label className="block text-sm">
              Espessura da borda: {municipalityLineWidth}
            </label>
            <input
              className="w-full"
              type="range"
              min={1}
              max={6}
              value={municipalityLineWidth}
              onChange={(event) =>
                setMunicipalityLineWidth(Number(event.target.value))
              }
            />
            <label className="block text-sm">Cor</label>
            <input
              type="color"
              value={municipalityColor}
              onChange={(event) => setMunicipalityColor(event.target.value)}
            />
          </section>

          <section className="mt-4 space-y-3 rounded-md border border-border p-3">
            <h2 className="font-medium">Scatterplot</h2>
            <label className="block text-sm">Pontos por municipio: {scatterCount}</label>
            <input
              className="w-full"
              type="range"
              min={1}
              max={20}
              value={scatterCount}
              onChange={(event) => setScatterCount(Number(event.target.value))}
            />
            <label className="block text-sm">Raio base: {scatterRadius}</label>
            <input
              className="w-full"
              type="range"
              min={300}
              max={3000}
              step={100}
              value={scatterRadius}
              onChange={(event) => setScatterRadius(Number(event.target.value))}
            />
            <label className="block text-sm">Opacidade: {scatterOpacity}%</label>
            <input
              className="w-full"
              type="range"
              min={0}
              max={100}
              value={scatterOpacity}
              onChange={(event) => setScatterOpacity(Number(event.target.value))}
            />
            <label className="block text-sm">Cor</label>
            <input
              type="color"
              value={scatterColor}
              onChange={(event) => setScatterColor(event.target.value)}
            />
          </section>

          <section className="mt-4 space-y-3 rounded-md border border-border p-3">
            <h2 className="font-medium">Marker Points</h2>
            <label className="block text-sm">Raio: {markerRadius}</label>
            <input
              className="w-full"
              type="range"
              min={600}
              max={5000}
              step={100}
              value={markerRadius}
              onChange={(event) => setMarkerRadius(Number(event.target.value))}
            />
            <label className="block text-sm">Cor</label>
            <input
              type="color"
              value={markerColor}
              onChange={(event) => setMarkerColor(event.target.value)}
            />
          </section>
        </aside>

        <section className="relative h-full w-full">
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller
            layers={layers}
            getTooltip={getTooltip}
          >
            <Map
              reuseMaps
              mapStyle={MAP_STYLES[mapStyle]}
              attributionControl
            />
          </DeckGL>
        </section>
      </div>
    </main>
  );
}
