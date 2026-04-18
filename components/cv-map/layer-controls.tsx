"use client";

import type { Dispatch, SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LAYER_OPTIONS } from "@/components/cv-map/constants";
import type { LayerOption, MapState } from "@/components/cv-map/types";

type Props = {
  selectedLayer: LayerOption;
  setSelectedLayer: Dispatch<SetStateAction<LayerOption>>;
  state: MapState;
  setState: Dispatch<SetStateAction<MapState>>;
};

export function LayerControls({
  selectedLayer,
  setSelectedLayer,
  state,
  setState,
}: Props) {
  const update = <K extends keyof MapState>(key: K, value: MapState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <section className="mt-4 space-y-3 rounded-md border border-border p-3">
        <h2 className="font-medium">Camadas</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedLayer}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Selecionar camada ativa</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={selectedLayer}
              onValueChange={(value) => setSelectedLayer(value as LayerOption)}
            >
              {LAYER_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {option}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {selectedLayer === "Municipios" && (
        <section className="mt-4 space-y-3 rounded-md border border-border p-3">
          <h2 className="font-medium">Municipios</h2>
          <label className="block text-sm">Opacidade: {state.municipalityOpacity}%</label>
          <input
            className="w-full"
            type="range"
            min={0}
            max={100}
            value={state.municipalityOpacity}
            onChange={(event) => update("municipalityOpacity", Number(event.target.value))}
          />
          <label className="block text-sm">
            Espessura da borda: {state.municipalityLineWidth}
          </label>
          <input
            className="w-full"
            type="range"
            min={1}
            max={6}
            value={state.municipalityLineWidth}
            onChange={(event) => update("municipalityLineWidth", Number(event.target.value))}
          />
          {/* <label className="block text-sm">Cor</label>
          <input
            className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-border bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
            type="color"
            value={state.municipalityColor}
            onChange={(event) => update("municipalityColor", event.target.value)}
          /> */}

          <div className="mt-2 border-t border-border pt-2">
            <p className="mb-2 text-sm font-medium">Bordas do município</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.municipioBorderSameAsFill}
                onChange={(event) =>
                  update("municipioBorderSameAsFill", event.target.checked)
                }
              />
              Borda igual à cor do município
            </label>
            <label className="mt-1 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.municipioBorderInvisible ?? false}
                onChange={(event) =>
                  update("municipioBorderInvisible", event.target.checked)
                }
              />
              Borda invisível
            </label>
          </div>

          <label className="block text-sm">Cor específica da borda</label>
          <input
            className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-border bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
            type="color"
            value={state.municipioBorderColor}
            disabled={
              (state.municipioBorderSameAsFill ?? false) ||
              (state.municipioBorderInvisible ?? false)
            }
            onChange={(event) => update("municipioBorderColor", event.target.value)}
          />
          <label className="block text-xs text-muted-foreground">
            Use esta cor quando “Borda igual...” e “Borda invisível” estiverem desativadas.
          </label>
        </section>
      )}

      {selectedLayer === "Scatterplot" && (
        <section className="mt-4 space-y-3 rounded-md border border-border p-3">
          <h2 className="font-medium">Scatterplot</h2>
          <label className="block text-sm">
            Pontos por municipio: {state.scatterCount}
          </label>
          <input
            className="w-full"
            type="range"
            min={1}
            max={20}
            value={state.scatterCount}
            onChange={(event) => update("scatterCount", Number(event.target.value))}
          />
          <label className="block text-sm">Raio base: {state.scatterRadius}</label>
          <input
            className="w-full"
            type="range"
            min={300}
            max={3000}
            step={100}
            value={state.scatterRadius}
            onChange={(event) => update("scatterRadius", Number(event.target.value))}
          />
          <label className="block text-sm">Opacidade: {state.scatterOpacity}%</label>
          <input
            className="w-full"
            type="range"
            min={0}
            max={100}
            value={state.scatterOpacity}
            onChange={(event) => update("scatterOpacity", Number(event.target.value))}
          />
          <label className="block text-sm">Cor</label>
          <input
            className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-border bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
            type="color"
            value={state.scatterColor}
            onChange={(event) => update("scatterColor", event.target.value)}
          />
        </section>
      )}

      {selectedLayer === "HexagonLayer" && (
        <section className="mt-4 space-y-3 rounded-md border border-border p-3">
          <h2 className="font-medium">HexagonLayer</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.hexagonExtruded}
              onChange={(event) => update("hexagonExtruded", event.target.checked)}
            />
            Extrudado 3D
          </label>
          <label className="block text-sm">Radius: {state.hexagonRadius}</label>
          <input
            className="w-full"
            type="range"
            min={500}
            max={8000}
            step={100}
            value={state.hexagonRadius}
            onChange={(event) => update("hexagonRadius", Number(event.target.value))}
          />
          <label className="block text-sm">Coverage: {state.hexagonCoverage.toFixed(2)}</label>
          <input
            className="w-full"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={state.hexagonCoverage}
            onChange={(event) => update("hexagonCoverage", Number(event.target.value))}
          />
          <label className="block text-sm">
            Upper Percentile: {state.hexagonUpperPercentile.toFixed(1)}
          </label>
          <input
            className="w-full"
            type="range"
            min={80}
            max={100}
            step={0.1}
            value={state.hexagonUpperPercentile}
            onChange={(event) =>
              update("hexagonUpperPercentile", Number(event.target.value))
            }
          />
          <label className="block text-sm">
            Elevation Scale: {state.hexagonElevationScale}
          </label>
          <input
            className="w-full"
            type="range"
            min={5}
            max={200}
            step={5}
            value={state.hexagonElevationScale}
            onChange={(event) =>
              update("hexagonElevationScale", Number(event.target.value))
            }
          />
        </section>
      )}

      {selectedLayer === "Marker points" && (
        <section className="mt-4 space-y-3 rounded-md border border-border p-3">
          <h2 className="font-medium">Marker points</h2>
          <label className="block text-sm">Raio: {state.markerRadius}</label>
          <input
            className="w-full"
            type="range"
            min={600}
            max={5000}
            step={100}
            value={state.markerRadius}
            onChange={(event) => update("markerRadius", Number(event.target.value))}
          />
          <label className="block text-sm">Cor</label>
          <input
            className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-border bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
            type="color"
            value={state.markerColor}
            onChange={(event) => update("markerColor", event.target.value)}
          />
        </section>
      )}

      {selectedLayer === "IconLayer" && (
        <section className="mt-4 space-y-3 rounded-md border border-border p-3">
          <h2 className="font-medium">IconLayer</h2>
          <label className="block text-sm">
            Pontos por municipio (cluster): {state.iconPointsPerMunicipality}
          </label>
          <input
            className="w-full"
            type="range"
            min={5}
            max={120}
            step={5}
            value={state.iconPointsPerMunicipality}
            onChange={(event) =>
              update("iconPointsPerMunicipality", Number(event.target.value))
            }
          />
          <label className="block text-sm">
            Zoom para abrir cluster: {state.iconClusterZoom.toFixed(1)}
          </label>
          <input
            className="w-full"
            type="range"
            min={6}
            max={10.5}
            step={0.1}
            value={state.iconClusterZoom}
            onChange={(event) => update("iconClusterZoom", Number(event.target.value))}
          />
          <label className="block text-sm">Tamanho do icone: {state.iconSize}</label>
          <input
            className="w-full"
            type="range"
            min={20}
            max={80}
            value={state.iconSize}
            onChange={(event) => update("iconSize", Number(event.target.value))}
          />
          <label className="block text-sm">Cor do icone</label>
          <input
            className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-border bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
            type="color"
            value={state.iconColor}
            onChange={(event) => update("iconColor", event.target.value)}
          />
        </section>
      )}
    </>
  );
}
