"use client";

import { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import Map from "react-map-gl/maplibre";
import { LayerControls } from "@/components/cv-map/layer-controls";
import { buildLayers } from "@/components/cv-map/layer-controller";
import { MapStyleSelector } from "@/components/cv-map/map-style-selector";
import {
  MUNICIPIOS_FILTER_LIMITS,
  MunicipiosToolbox,
} from "@/components/cv-map/municipios-toolbox";
import { INITIAL_VIEW_STATE, MAP_STYLES } from "@/components/cv-map/constants";
import { getMapTooltip } from "@/components/cv-map/tooltip";
import {
  buildClusterIconPoints,
  buildExpandedIconPoints,
  buildMarkerPoints,
  buildScatterPoints,
} from "@/components/cv-map/utils";
import type { LayerOption, MapState } from "@/components/cv-map/types";

type MapStyleName = keyof typeof MAP_STYLES;

const INITIAL_MAP_STATE: MapState = {
  municipalityOpacity: 45,
  municipalityLineWidth: 2,
  municipalityColor: "#22d3ee",
  municipioValueMinFilter: MUNICIPIOS_FILTER_LIMITS.min,
  municipioValueMaxFilter: MUNICIPIOS_FILTER_LIMITS.max,
  scatterCount: 8,
  scatterRadius: 1200,
  scatterOpacity: 65,
  scatterColor: "#84cc16",
  hexagonRadius: 2500,
  hexagonCoverage: 0.75,
  hexagonUpperPercentile: 100,
  hexagonElevationScale: 70,
  hexagonExtruded: true,
  markerRadius: 2600,
  markerColor: "#f97316",
  labelSize: 12,
  labelColor: "#ffffff",
  labelOffset: 8,
  iconSize: 40,
  iconColor: "#38bdf8",
  iconPointsPerMunicipality: 12,
  iconClusterZoom: 8.3,
};

export default function HomePage() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [mapStyle, setMapStyle] = useState<MapStyleName>("Escuro");
  const [selectedLayer, setSelectedLayer] =
    useState<LayerOption>("HexagonLayer");
  const [state, setState] = useState<MapState>(INITIAL_MAP_STATE);

  const markerPoints = useMemo(() => buildMarkerPoints(), []);

  const scatterPoints = useMemo(
    () => buildScatterPoints(state.scatterCount),
    [state.scatterCount]
  );

  const clusterIconPoints = useMemo(
    () =>
      buildClusterIconPoints(
        markerPoints,
        state.iconColor,
        state.iconPointsPerMunicipality
      ),
    [markerPoints, state.iconColor, state.iconPointsPerMunicipality]
  );

  const expandedIconPoints = useMemo(
    () =>
      buildExpandedIconPoints(
        markerPoints,
        state.iconColor,
        state.iconPointsPerMunicipality
      ),
    [markerPoints, state.iconColor, state.iconPointsPerMunicipality]
  );

  const layers = useMemo(
    () =>
      buildLayers({
        selectedLayer,
        state,
        zoom: viewState.zoom ?? INITIAL_VIEW_STATE.zoom,
        markerPoints,
        scatterPoints,
        clusterIconPoints,
        expandedIconPoints,
      }),
    [
      selectedLayer,
      state,
      viewState.zoom,
      markerPoints,
      scatterPoints,
      clusterIconPoints,
      expandedIconPoints,
    ]
  );

  const handleMaxFilterChange = (value: number) => {
    setState((prev) => ({
      ...prev,
      municipioValueMaxFilter: Math.max(value, prev.municipioValueMinFilter),
    }));
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[360px_1fr]">
        <aside className="z-10 overflow-y-auto border-r border-border bg-card p-4">
          <h1 className="text-xl font-semibold">CV Map Sandbox</h1>

          <MapStyleSelector mapStyle={mapStyle} setMapStyle={setMapStyle} />
          <LayerControls
            selectedLayer={selectedLayer}
            setSelectedLayer={setSelectedLayer}
            state={state}
            setState={setState}
          />
        </aside>

        <section className="relative h-full w-full">
          <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState: nextViewState }) => {
              setViewState(nextViewState as typeof INITIAL_VIEW_STATE);
            }}
            controller
            layers={layers}
            getTooltip={getMapTooltip}
          >
            <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} />
          </DeckGL>
          {selectedLayer === "Municipios" && (
            <MunicipiosToolbox
              maxFilter={state.municipioValueMaxFilter}
              onMaxChange={handleMaxFilterChange}
            />
          )}
        </section>
      </div>
    </main>
  );
}
