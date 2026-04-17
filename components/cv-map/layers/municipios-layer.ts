"use client";

import { GeoJsonLayer } from "@deck.gl/layers";
import { caboverde } from "@/lib/caboverde";
import type { MapState } from "@/components/cv-map/types";
import { hexToRgb } from "@/components/cv-map/utils";
import municipiosValores from "@/data/municipios-valores.json";

type MunicipioValor = {
  comissao: string;
  total_eleitores: number;
  intervalo: string;
  color: string;
};

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

const ALIASES: Record<string, string> = {
  ribeiragrandedesantiago: "ribeiragrandesantiago",
};

const municipioColorMap = (municipiosValores as MunicipioValor[]).reduce<
  Record<string, string>
>((acc, item) => {
  acc[normalizeName(item.comissao)] = item.color;
  return acc;
}, {});

const municipioValueMap = (municipiosValores as MunicipioValor[]).reduce<
  Record<string, number>
>((acc, item) => {
  acc[normalizeName(item.comissao)] = item.total_eleitores;
  return acc;
}, {});

const MUNICIPIO_ABSOLUTE_MAX = Math.max(
  ...(municipiosValores as MunicipioValor[]).map((item) => item.total_eleitores)
);

function getFilteredMunicipiosData(state: MapState) {
  const effectiveMaxFilter =
    state.municipioValueMaxFilter >= MUNICIPIO_ABSOLUTE_MAX - 1
      ? Number.POSITIVE_INFINITY
      : state.municipioValueMaxFilter;

  const filteredFeatures = caboverde.features.filter((feature) => {
    const rawName = feature?.properties?.NAME_1 ?? "";
    const normalized = normalizeName(rawName);
    const aliased = ALIASES[normalized] ?? normalized;
    const value = municipioValueMap[aliased];

    if (typeof value !== "number") return true;

    return (
      value >= state.municipioValueMinFilter &&
      value <= effectiveMaxFilter
    );
  });

  return {
    ...caboverde,
    features: filteredFeatures,
  } as any;
}

export function createMunicipiosLayer(
  state: MapState,
  hoveredMunicipioId: string | null
) {
  const fallbackRgb = hexToRgb(state.municipalityColor);
  const data = getFilteredMunicipiosData(state);

  return new GeoJsonLayer({
    id: "municipios",
    data,
    extruded: true,
    stroked: false,
    filled: true,
    pickable: true,
    getElevation: (feature: any) =>
      feature?.properties?.GID_1 === hoveredMunicipioId ? 1800 : 0,
    getFillColor: (feature: any) => {
      const rawName = feature?.properties?.NAME_1 ?? "";
      const normalized = normalizeName(rawName);
      const aliased = ALIASES[normalized] ?? normalized;
      const hex = municipioColorMap[aliased];
      const rgb = hex ? hexToRgb(hex) : fallbackRgb;
      const isHovered = feature?.properties?.GID_1 === hoveredMunicipioId;
      const alphaBase = Math.round((state.municipalityOpacity / 100) * 255);
      return [
        rgb[0],
        rgb[1],
        rgb[2],
        isHovered ? Math.min(255, alphaBase + 40) : alphaBase,
      ];
    },
    updateTriggers: {
      getFillColor: [hoveredMunicipioId, state.municipalityOpacity],
      getElevation: [hoveredMunicipioId],
    },
  });
}

export function createMunicipiosBordersLayer(state: MapState) {
  const data = getFilteredMunicipiosData(state);
  const fixedBorderRgb = hexToRgb(state.municipioBorderColor);

  return new GeoJsonLayer({
    id: "municipios-borders",
    data,
    stroked: true,
    filled: false,
    pickable: false,
    lineWidthUnits: "pixels",
    lineWidthScale: 1,
    lineWidthMinPixels: Math.max(1.5, state.municipalityLineWidth + 1),
    getLineWidth: Math.max(1.5, state.municipalityLineWidth + 1),
    getLineColor: (feature: any) => {
      if (state.municipioBorderSameAsFill) {
        return [0, 0, 0, 0];
      }

      if (!state.municipioBorderSameAsFill) {
        return [fixedBorderRgb[0], fixedBorderRgb[1], fixedBorderRgb[2], 255];
      }

      const rawName = feature?.properties?.NAME_1 ?? "";
      const normalized = normalizeName(rawName);
      const aliased = ALIASES[normalized] ?? normalized;
      const hex = municipioColorMap[aliased];
      const rgb = hex ? hexToRgb(hex) : fixedBorderRgb;
      return [rgb[0], rgb[1], rgb[2], 255];
    },
    updateTriggers: {
      getLineColor: [state.municipioBorderSameAsFill, state.municipioBorderColor],
    },
  });
}
