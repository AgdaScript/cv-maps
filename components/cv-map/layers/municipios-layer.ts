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

export function createMunicipiosLayer(state: MapState) {
  const fallbackRgb = hexToRgb(state.municipalityColor);
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

  return new GeoJsonLayer({
    id: "municipios",
    data: {
      ...caboverde,
      features: filteredFeatures,
    } as any,
    stroked: true,
    filled: true,
    pickable: true,
    lineWidthMinPixels: state.municipalityLineWidth,
    getLineColor: [235, 235, 235, 230],
    getFillColor: (feature: any) => {
      const rawName = feature?.properties?.NAME_1 ?? "";
      const normalized = normalizeName(rawName);
      const aliased = ALIASES[normalized] ?? normalized;
      const hex = municipioColorMap[aliased];
      const rgb = hex ? hexToRgb(hex) : fallbackRgb;
      return [
        rgb[0],
        rgb[1],
        rgb[2],
        Math.round((state.municipalityOpacity / 100) * 255),
      ];
    },
  });
}
