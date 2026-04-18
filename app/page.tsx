"use client";

import { useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Instagram, Linkedin, Music2 } from "lucide-react";
import Map from "react-map-gl/maplibre";
import { LayerControls } from "@/components/cv-map/layer-controls";
import { buildLayers } from "@/components/cv-map/layer-controller";
import { MapStyleSelector } from "@/components/cv-map/map-style-selector";
import {
  MUNICIPIOS_FILTER_LIMITS,
  MunicipiosToolbox,
} from "@/components/cv-map/municipios-toolbox";
import { MapActionsCard } from "@/components/cv-map/map-actions-card";
import {
  INITIAL_VIEW_STATE,
  MAP_STYLES,
  type MapStyleName,
} from "@/components/cv-map/constants";
import { getMapTooltip } from "@/components/cv-map/tooltip";
import {
  buildClusterIconPoints,
  buildExpandedIconPoints,
  buildMarkerPoints,
  buildScatterPoints,
} from "@/components/cv-map/utils";
import type { LayerOption, MapState } from "@/components/cv-map/types";

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
  iconSize: 40,
  iconColor: "#38bdf8",
  iconPointsPerMunicipality: 12,
  iconClusterZoom: 8.3,
};

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/agda-lopes/",
    Icon: Linkedin,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@agdascript?_r=1&_t=ZS-95e1vU44Fya",
    Icon: Music2,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/agdascript?igsh=MTNxeXdpYTQ0cXZwZw==",
    Icon: Instagram,
  },
] as const;

export default function HomePage() {
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [mapStyle, setMapStyle] = useState<MapStyleName>("Dark");
  const [selectedLayer, setSelectedLayer] =
    useState<LayerOption>("Municipalities");
  const [state, setState] = useState<MapState>(INITIAL_MAP_STATE);
  const [hoveredMunicipioId, setHoveredMunicipioId] = useState<string | null>(null);
  const municipiosHeaderTheme = MUNICIPIOS_HEADER_THEME[mapStyle];

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
        hoveredMunicipioId,
        markerPoints,
        scatterPoints,
        clusterIconPoints,
        expandedIconPoints,
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
    ]
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
    <main className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[360px_1fr]">
        <aside className="z-10 overflow-y-auto border-r border-border bg-card p-4">
          <h1 className="text-xl font-semibold">CV Map Sandbox</h1>
          <section className="mt-4 space-y-2">
            <h2 className="font-medium">About Author</h2>
            <p className="text-sm">
              This project is a sandbox for testing the cv-map library. Made by{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                Agda Lopes
              </span>
              .
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-accent"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="pt-2">
              <div className="border-b border-border" />
            </div>
          </section>

          <MapStyleSelector mapStyle={mapStyle} setMapStyle={setMapStyle} />
          <div className="my-3 border-b border-border" />
          <LayerControls
            selectedLayer={selectedLayer}
            setSelectedLayer={setSelectedLayer}
            state={state}
            setState={setState}
          />
        </aside>

        <section ref={mapSectionRef} className="relative h-full w-full">
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
            controller
            layers={layers}
            getTooltip={(info) => getMapTooltip(info, mapStyle)}
          >
            <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} />
          </DeckGL>
          {selectedLayer === "Municipalities" && (
            <>
              <div
                className={`pointer-events-auto absolute top-4 left-4 z-20 select-text ${municipiosHeaderTheme.shadow}`}
              >
                <h2 className={`text-lg font-semibold leading-tight ${municipiosHeaderTheme.title}`}>
                  Cabo Verde Census Data
                </h2>
                <p className={`text-sm ${municipiosHeaderTheme.subtitle}`}>
                Distribution of competitors by municipality
                </p>
              </div>
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
      </div>
    </main>
  );
}
