"use client";

import type { PickingInfo } from "@deck.gl/core";
import municipiosValores from "@/data/municipios-valores.json";
import type { MapStyleName } from "@/components/cv-map/constants";

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const DEFAULT_ACCIDENT_SEX_COLOR: Record<string, string> = {
  Homem: "#2563eb",
  Mulher: "#ec4899",
};

const ACCIDENT_SEX_LABEL: Record<string, string> = {
  Homem: "Male",
  Mulher: "Female",
};

const TOOLTIP_THEME: Record<
  MapStyleName,
  { border: string; background: string; text: string; shadow: string; title: string }
> = {
  Dark: {
    border: "rgba(255,255,255,0.2)",
    background: "rgba(20,20,24,0.96)",
    text: "#f3f4f6",
    shadow: "0 10px 30px rgba(0,0,0,0.35)",
    title: "#ffffff",
  },
  Light: {
    border: "rgba(15,23,42,0.18)",
    background: "rgba(255,255,255,0.96)",
    text: "#0f172a",
    shadow: "0 10px 28px rgba(2,8,23,0.12)",
    title: "#0f172a",
  },
  Voyager: {
    border: "rgba(120,53,15,0.2)",
    background: "rgba(255,251,235,0.95)",
    text: "#451a03",
    shadow: "0 10px 28px rgba(120,53,15,0.16)",
    title: "#7c2d12",
  },
};

export type ScatterTooltipColors = {
  male: string;
  female: string;
};

export function getMapTooltip(
  info: PickingInfo<any>,
  mapStyle: MapStyleName = "Dark",
  scatterColors?: ScatterTooltipColors
) {
  const object = info.object;
  if (!object) return null;
  const theme = TOOLTIP_THEME[mapStyle];

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
          border:1px solid ${theme.border};
          background:${theme.background};
          color:${theme.text};
          padding:14px 14px 14px 10px;
          box-shadow:${theme.shadow};
          font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
        ">
          <div style="
            width:6px;
            border-radius:999px;
            background:${color};
          "></div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <div style="font-size:14px;font-weight:700;line-height:1.1;color:${theme.title};">Census Data</div>
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

  if (
    typeof object?.location === "string" &&
    typeof object?.municipality === "string" &&
    (object.sex === "Homem" || object.sex === "Mulher") &&
    typeof object?.value === "number"
  ) {
    const barColor =
      object.sex === "Homem"
        ? scatterColors?.male ?? DEFAULT_ACCIDENT_SEX_COLOR.Homem
        : scatterColors?.female ?? DEFAULT_ACCIDENT_SEX_COLOR.Mulher;
    const sexLabel = ACCIDENT_SEX_LABEL[object.sex] ?? String(object.sex);
    const location = escapeHtml(object.location);

    return {
      html: `
        <div style="
          display:flex;
          gap:12px;
          align-items:stretch;
          min-width:280px;
          border-radius:16px;
          border:1px solid ${theme.border};
          background:${theme.background};
          color:${theme.text};
          padding:14px 14px 14px 10px;
          box-shadow:${theme.shadow};
          font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
        ">
          <div style="
            width:6px;
            border-radius:999px;
            background:${barColor};
          "></div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="font-size:14px;font-weight:700;line-height:1.1;color:${theme.title};">Traffic accident</div>
            <div style="font-size:13px;line-height:1.35;opacity:0.92;">
              <span style="font-weight:600;">Sex:</span> ${sexLabel}
            </div>
            <div style="font-size:13px;line-height:1.35;opacity:0.92;">
              <span style="font-weight:600;">Location:</span> ${location}
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

  if ("count" in object) {
    return `Cluster\nMunicipality: ${object.name}\nTotal: ${object.count}`;
  }

  if ("municipality" in object) {
    return `Icon\nMunicipality: ${object.municipality}`;
  }

  if ("name" in object) {
    return `Marker\nMunicipality: ${object.name}`;
  }

  return null;
}
