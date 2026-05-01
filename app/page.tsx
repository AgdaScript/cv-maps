"use client";

import type { PickingInfo } from "@deck.gl/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import Map from "react-map-gl/maplibre";
import { CvMapSidebar } from "@/components/cv-map/cv-map-sidebar";
import { buildLayers } from "@/components/cv-map/layer-controller";
import {
  MUNICIPIOS_FILTER_LIMITS,
  MunicipiosToolbox,
} from "@/components/cv-map/municipios-toolbox";
import { MapActionsCard } from "@/components/cv-map/map-actions-card";
import {
  INITIAL_VIEW_STATE,
  LAYER_MAP_HEADERS,
  MAP_STYLES,
  TRAFFIC_ACCIDENTS_SCATTER_MAX,
  type MapStyleName,
} from "@/components/cv-map/constants";
import { getMapTooltip } from "@/components/cv-map/tooltip";
import { TrafficAccidentsPanel } from "../components/cv-map/traffic-accidents-panel";
import {
  buildClusterIconPoints,
  buildExpandedIconPoints,
  buildMarkerPoints,
  buildScatterPoints,
  countScatterPointsBySexInSlice,
  filterScatterPointsBySex,
} from "@/components/cv-map/utils";
import { fetchDrivingRoute } from "@/lib/osrm-route";
import type {
  LayerOption,
  MapState,
  Position,
  RouteEndpoint,
} from "@/components/cv-map/types";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const MUNICIPIOS_HEADER_THEME: Record<
  MapStyleName,
  { title: string; subtitle: string; shadow: string }
> = {
  Dark: {
    title: "text-slate-50",
    subtitle: "text-slate-300",
    shadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]",
  },
  Light: {
    title: "text-slate-900",
    subtitle: "text-slate-600",
    shadow: "drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]",
  },
  Voyager: {
    title: "text-slate-900",
    subtitle: "text-slate-700",
    shadow: "drop-shadow-[0_1px_2px_rgba(255,255,255,0.35)]",
  },
};

const INITIAL_MAP_STATE: MapState = {
  municipalityOpacity: 78,
  municipalityLineWidth: 2,
  municipalityColor: "#22d3ee",
  municipioBorderSameAsFill: false,
  municipioBorderInvisible: true,
  municipioBorderColor: "#ffffff",
  municipioValueMinFilter: MUNICIPIOS_FILTER_LIMITS.min,
  municipioValueMaxFilter: MUNICIPIOS_FILTER_LIMITS.max,
  scatterCount: TRAFFIC_ACCIDENTS_SCATTER_MAX,
  scatterShowMen: true,
  scatterShowWomen: true,
  scatterRadius: 1200,
  scatterOpacity: 65,
  scatterColorMale: "#2563eb",
  scatterColorFemale: "#ec4899",
  scatterBorderColor: "#ffffff",
  scatterBorderInvisible: false,
  hexagonRadius: 2500,
  hexagonCoverage: 0.75,
  hexagonUpperPercentile: 100,
  hexagonElevationScale: 70,
  hexagonExtruded: true,
  markerRadius: 2600,
  markerColor: "#f97316",
  iconSize: 40,
  iconColor: "#38bdf8",
  iconPointsPerMunicipality: 12,
  iconClusterZoom: 8.3,
};

export default function HomePage() {
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [mapStyle, setMapStyle] = useState<MapStyleName>("Dark");
  const [selectedLayer, setSelectedLayer] =
    useState<LayerOption>("Municipalities");
  const [state, setState] = useState<MapState>(INITIAL_MAP_STATE);
  const [hoveredMunicipioId, setHoveredMunicipioId] = useState<string | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<RouteEndpoint[]>([]);
  const [routePath, setRoutePath] = useState<Position[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const municipiosHeaderTheme = MUNICIPIOS_HEADER_THEME[mapStyle];

  const markerPoints = useMemo(() => buildMarkerPoints(), []);

  const scatterSliceSexCounts = useMemo(
    () => countScatterPointsBySexInSlice(state.scatterCount),
    [state.scatterCount]
  );

  const scatterPoints = useMemo(() => {
    const built = buildScatterPoints(state.scatterCount);
    return filterScatterPointsBySex(
      built,
      state.scatterShowMen,
      state.scatterShowWomen
    );
  }, [
    state.scatterCount,
    state.scatterShowMen,
    state.scatterShowWomen,
  ]);

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
        hoveredMunicipioId,
        markerPoints,
        scatterPoints,
        clusterIconPoints,
        expandedIconPoints,
        routeMarkers,
        routePath,
      }),
    [
      selectedLayer,
      state,
      viewState.zoom,
      hoveredMunicipioId,
      markerPoints,
      scatterPoints,
      clusterIconPoints,
      expandedIconPoints,
      routeMarkers,
      routePath,
    ]
  );

  useEffect(() => {
    if (selectedLayer !== "Route Map") {
      setRouteMarkers([]);
      setRoutePath(null);
      setRouteLoading(false);
    }
  }, [selectedLayer]);

  const handleRouteMapClick = useCallback(
    (info: PickingInfo) => {
      if (selectedLayer !== "Route Map") return;
      const viewport = info.viewport;
      if (!viewport || typeof info.x !== "number" || typeof info.y !== "number") {
        return;
      }
      const unprojected = viewport.unproject([info.x, info.y]);
      if (!unprojected) return;
      const position: Position = [unprojected[0], unprojected[1]];

      setRouteMarkers((prev) => {
        if (prev.length === 2) {
          setRoutePath(null);
          return [{ position, label: "A" }];
        }
        if (prev.length === 0) {
          setRoutePath(null);
          return [{ position, label: "A" }];
        }
        if (prev.length === 1) {
          const start = prev[0].position;
          void (async () => {
            setRouteLoading(true);
            setRoutePath(null);
            try {
              const path = await fetchDrivingRoute(start, position);
              setRoutePath(path);
            } finally {
              setRouteLoading(false);
            }
          })();
          return [prev[0], { position, label: "B" }];
        }
        return prev;
      });
    },
    [selectedLayer]
  );

  const handleMaxFilterChange = (value: number) => {
    setState((prev) => ({
      ...prev,
      municipioValueMaxFilter: Math.max(value, prev.municipioValueMinFilter),
    }));
  };

  const handleDownloadMapImage = () => {
    const container = mapSectionRef.current;
    if (!container) return;

    const canvases = Array.from(
      container.querySelectorAll("canvas")
    ) as HTMLCanvasElement[];
    if (canvases.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(containerRect.width));
    const height = Math.max(1, Math.floor(containerRect.height));
    const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = Math.floor(width * devicePixelRatio);
    exportCanvas.height = Math.floor(height * devicePixelRatio);
    const context = exportCanvas.getContext("2d");
    if (!context) return;

    context.scale(devicePixelRatio, devicePixelRatio);
    context.fillStyle = "#111827";
    context.fillRect(0, 0, width, height);

    canvases.forEach((canvas) => {
      const canvasRect = canvas.getBoundingClientRect();
      const offsetX = canvasRect.left - containerRect.left;
      const offsetY = canvasRect.top - containerRect.top;

      try {
        context.drawImage(canvas, offsetX, offsetY, canvasRect.width, canvasRect.height);
      } catch {
        // Ignora canvas que não possa ser exportado por restrições de segurança.
      }
    });

    try {
      const dataUrl = exportCanvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = "cv-map.png";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      window.alert("Não foi possível exportar a imagem do mapa neste navegador.");
    }
  };

  return (
    <SidebarProvider
      defaultOpen
      className="relative box-border max-w-[100vw] overflow-hidden bg-background text-foreground"
      style={{
        "--sidebar-width": "20rem",
        "--sidebar-width-mobile": "min(100vw - 1rem, 22rem)",
      } as React.CSSProperties}
    >
      <CvMapSidebar
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        selectedLayer={selectedLayer}
        setSelectedLayer={setSelectedLayer}
        state={state}
        setState={setState}
      />
      <SidebarInset className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-background p-0">
        <SidebarTrigger className="pointer-events-auto fixed top-[max(0.5rem,calc(env(safe-area-inset-top)+6px))] left-[max(0.5rem,calc(env(safe-area-inset-left)+6px))] z-[100] size-11 rounded-xl border border-border bg-background/95 shadow-md backdrop-blur md:absolute md:z-[85] md:size-10" />
        <section
          ref={mapSectionRef}
          className="relative flex flex-1 min-h-0 min-w-0 w-full"
        >
          <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState: nextViewState }) => {
              setViewState(nextViewState as typeof INITIAL_VIEW_STATE);
            }}
            onHover={(info) => {
              if (selectedLayer !== "Municipalities") {
                if (hoveredMunicipioId !== null) setHoveredMunicipioId(null);
                return;
              }

              const gid = info.object?.properties?.GID_1 ?? null;
              setHoveredMunicipioId(gid);
            }}
            onClick={handleRouteMapClick}
            controller
            layers={layers}
            getTooltip={(info) =>
              getMapTooltip(info, mapStyle, {
                male: state.scatterColorMale,
                female: state.scatterColorFemale,
              })
            }
          >
            <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} />
          </DeckGL>
          <div className="pointer-events-auto absolute top-2 left-14 z-20 flex max-w-[min(calc(100vw-9rem),28rem)] flex-col gap-2 sm:top-4 sm:left-14 sm:max-w-[min(calc(100%-2rem),28rem)] sm:gap-3">
            <div className={`select-text ${municipiosHeaderTheme.shadow}`}>
              <h2
                className={`text-base font-semibold leading-snug tracking-tight sm:text-lg md:leading-tight ${municipiosHeaderTheme.title}`}
              >
                {LAYER_MAP_HEADERS[selectedLayer].title}
              </h2>
              <p
                className={`mt-0.5 text-xs leading-snug sm:mt-0 sm:text-sm sm:leading-normal ${municipiosHeaderTheme.subtitle}`}
              >
                {LAYER_MAP_HEADERS[selectedLayer].subtitle}
              </p>
            </div>
            {selectedLayer === "Route Map" && (
              <div
                className={`rounded-xl border border-border bg-card/90 p-2.5 text-xs shadow-lg backdrop-blur-md sm:rounded-2xl sm:p-3 sm:text-sm ${municipiosHeaderTheme.subtitle}`}
              >
                {routeMarkers.length === 0 && (
                  <p>Click the map to set point A (green pin).</p>
                )}
                {routeMarkers.length === 1 && (
                  <p>Click again to set point B (red pin) and load the driving route.</p>
                )}
                {routeMarkers.length === 2 && routeLoading && <p>Loading route…</p>}
                {routeMarkers.length === 2 &&
                  !routeLoading &&
                  routePath &&
                  routePath.length > 0 && (
                    <p className="text-emerald-600 dark:text-emerald-400">
                      Route drawn ({routePath.length} vertices).
                    </p>
                  )}
                {routeMarkers.length === 2 &&
                  !routeLoading &&
                  (!routePath || routePath.length === 0) && (
                    <p className="text-amber-700 dark:text-amber-400">
                      No road route for this pair. Try other points or check OSRM coverage.
                    </p>
                  )}
                {routeMarkers.length > 0 && (
                  <button
                    type="button"
                    className="mt-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    onClick={() => {
                      setRouteMarkers([]);
                      setRoutePath(null);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
          {selectedLayer === "Scatterplot" && (
            <div className="pointer-events-auto absolute bottom-3 left-2 right-2 z-20 max-h-[42svh] overflow-y-auto overscroll-contain rounded-2xl sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:max-h-none sm:max-w-[min(calc(100%-2rem),22rem)]">
              <TrafficAccidentsPanel
                mapStyle={mapStyle}
                maleCount={scatterSliceSexCounts.homem}
                femaleCount={scatterSliceSexCounts.mulher}
                scatterColorMale={state.scatterColorMale}
                scatterColorFemale={state.scatterColorFemale}
                showMen={state.scatterShowMen}
                showWomen={state.scatterShowWomen}
                onShowMenChange={(checked: boolean) =>
                  setState((prev) => ({ ...prev, scatterShowMen: checked }))
                }
                onShowWomenChange={(checked: boolean) =>
                  setState((prev) => ({ ...prev, scatterShowWomen: checked }))
                }
              />
            </div>
          )}
          {selectedLayer === "Municipalities" && (
            <>
              <MapActionsCard
                minFilter={state.municipioValueMinFilter}
                maxFilter={state.municipioValueMaxFilter}
                mapStyle={mapStyle}
                onDownloadMapImage={handleDownloadMapImage}
              />
              <MunicipiosToolbox
                maxFilter={state.municipioValueMaxFilter}
                mapStyle={mapStyle}
                onMaxChange={handleMaxFilterChange}
              />
            </>
          )}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
