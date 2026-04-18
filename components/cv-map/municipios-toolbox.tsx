"use client";

import municipiosValores from "@/data/municipios-valores.json";
import type { MapStyleName } from "@/components/cv-map/constants";

type MunicipioValor = {
  comissao: string;
  total_eleitores: number;
  intervalo: string;
  color: string;
};

const valores = (municipiosValores as MunicipioValor[]).map(
  (item) => item.total_eleitores
);
const ABSOLUTE_MIN = Math.min(...valores);
const ABSOLUTE_MAX = Math.max(...valores);

const orderedUniqueColorsLowToHigh = [
  ...new Set(
    [...(municipiosValores as MunicipioValor[])]
      .sort((a, b) => a.total_eleitores - b.total_eleitores)
      .map((item) => item.color)
  ),
];

const orderedUniqueColorsHighToLow = [...orderedUniqueColorsLowToHigh].reverse();

function buildSteppedVerticalGradient(colors: string[]) {
  const n = colors.length;
  if (n === 0) return "transparent";

  const stops: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const start = (i / n) * 100;
    const end = ((i + 1) / n) * 100;
    const color = colors[i];
    stops.push(`${color} ${start}%`, `${color} ${end}%`);
  }

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

const MUNICIPIOS_INTERVAL_GRADIENT = buildSteppedVerticalGradient(
  orderedUniqueColorsHighToLow
);

type Props = {
  maxFilter: number;
  mapStyle: MapStyleName;
  onMaxChange: (value: number) => void;
};

const TOOLBOX_THEME: Record<
  MapStyleName,
  { label: string; value: string; thumb: string }
> = {
  Escuro: {
    label: "text-slate-300",
    value: "text-slate-50",
    thumb:
      "[&::-webkit-slider-thumb]:bg-slate-100 [&::-webkit-slider-thumb]:border-slate-300/80 [&::-moz-range-thumb]:bg-slate-100 [&::-moz-range-thumb]:border-slate-300/80",
  },
  Claro: {
    label: "text-slate-600",
    value: "text-slate-900",
    thumb:
      "[&::-webkit-slider-thumb]:bg-slate-800 [&::-webkit-slider-thumb]:border-slate-600/80 [&::-moz-range-thumb]:bg-slate-800 [&::-moz-range-thumb]:border-slate-600/80",
  },
  Voyager: {
    label: "text-amber-900/80",
    value: "text-amber-950",
    thumb:
      "[&::-webkit-slider-thumb]:bg-amber-50 [&::-webkit-slider-thumb]:border-amber-900/70 [&::-moz-range-thumb]:bg-amber-50 [&::-moz-range-thumb]:border-amber-900/70",
  },
};

export function MunicipiosToolbox({
  maxFilter,
  mapStyle,
  onMaxChange,
}: Props) {
  const theme = TOOLBOX_THEME[mapStyle];
  // Inverte o mapeamento visual do range para que o topo represente "High"
  // e a base represente "Low", mantendo a lógica de filtro por valor máximo.
  const sliderValue = ABSOLUTE_MAX - (maxFilter - ABSOLUTE_MIN);

  const handleSliderChange = (rawValue: number) => {
    const mappedValue = ABSOLUTE_MAX - (rawValue - ABSOLUTE_MIN);
    onMaxChange(mappedValue);
  };

  return (
    <div className="pointer-events-auto absolute right-4 bottom-4 z-20 flex w-24 flex-col items-center gap-3">
      <div className={`text-center text-xs ${theme.label}`}>
        <div>High</div>
        <div className={`font-medium ${theme.value}`}>{maxFilter}</div>
      </div>

      <div className="relative flex h-24 w-10 items-center justify-center">
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 rounded-full"
          style={{ background: MUNICIPIOS_INTERVAL_GRADIENT }}
        />
        <input
          className={`relative z-10 h-6 w-24 rotate-90 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border ${theme.thumb}`}
          type="range"
          min={ABSOLUTE_MIN}
          max={ABSOLUTE_MAX}
          step={100}
          value={sliderValue}
          onChange={(event) => handleSliderChange(Number(event.target.value))}
        />
      </div>

      <div className={`text-center text-xs ${theme.label}`}>
        <div>Low</div>
        <div className={`font-medium ${theme.value}`}>{ABSOLUTE_MIN}</div>
      </div>
    </div>
  );
}

export const MUNICIPIOS_FILTER_LIMITS = {
  min: ABSOLUTE_MIN,
  max: ABSOLUTE_MAX,
};
