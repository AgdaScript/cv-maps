"use client";

import type { PickingInfo } from "@deck.gl/core";
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

const municipioInfoMap = (municipiosValores as MunicipioValor[]).reduce<
  Record<string, MunicipioValor>
>((acc, item) => {
  acc[normalizeName(item.comissao)] = item;
  return acc;
}, {});

export function getMapTooltip(info: PickingInfo<any>) {
  const object = info.object;
  if (!object) return null;

  const featureName = object?.properties?.NAME_1;
  if (typeof featureName === "string") {
    const normalized = normalizeName(featureName);
    const aliased = ALIASES[normalized] ?? normalized;
    const infoMunicipio = municipioInfoMap[aliased];
    const color = infoMunicipio?.color ?? "#22d3ee";
    const valor = infoMunicipio?.total_eleitores ?? 0;

    return {
      html: `
        <div style="
          display:flex;
          gap:12px;
          align-items:stretch;
          min-width:280px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,0.2);
          background:rgba(20,20,24,0.96);
          color:#f3f4f6;
          padding:14px 14px 14px 10px;
          box-shadow:0 10px 30px rgba(0,0,0,0.35);
          font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
        ">
          <div style="
            width:6px;
            border-radius:999px;
            background:${color};
          "></div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <div style="font-size:14px;font-weight:700;line-height:1.1;">Census Data</div>
            <div style="font-size:18px;font-weight:600;line-height:1.2;">
              ${featureName}: ${valor.toLocaleString("pt-PT")}
            </div>
          </div>
        </div>
      `,
      style: {
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        padding: "0",
        color: "inherit",
      },
    };
  }

  if (Array.isArray(object.points)) {
    return `Hexagono\nPontos agregados: ${object.points.length}`;
  }

  if ("municipality" in object && "value" in object) {
    return `Scatter\nMunicipio: ${object.municipality}\nValor: ${object.value}`;
  }

  if ("count" in object) {
    return `Cluster\nMunicipio: ${object.name}\nTotal: ${object.count}`;
  }

  if ("municipality" in object) {
    return `Icon\nMunicipio: ${object.municipality}`;
  }

  if ("name" in object) {
    return `Marker\nMunicipio: ${object.name}`;
  }

  return null;
}
