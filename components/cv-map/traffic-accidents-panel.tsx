"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MapStyleName } from "@/components/cv-map/constants";

type Props = {
  mapStyle: MapStyleName;
  maleCount: number;
  femaleCount: number;
  showMen: boolean;
  showWomen: boolean;
  onShowMenChange: (checked: boolean) => void;
  onShowWomenChange: (checked: boolean) => void;
};

const PANEL_THEME: Record<
  MapStyleName,
  {
    shell: string;
    title: string;
    body: string;
    stat: string;
    accentMale: string;
    accentFemale: string;
    hint: string;
    label: string;
  }
> = {
  Dark: {
    shell: "border-white/20 bg-slate-950/75 shadow-xl backdrop-blur-md",
    title: "text-slate-100",
    body: "text-slate-300",
    stat: "text-slate-50",
    accentMale: "bg-blue-600",
    accentFemale: "bg-pink-500",
    hint: "text-slate-400",
    label: "text-slate-200",
  },
  Light: {
    shell: "border-slate-900/15 bg-white/92 shadow-xl backdrop-blur-md",
    title: "text-slate-900",
    body: "text-slate-600",
    stat: "text-slate-900",
    accentMale: "bg-blue-600",
    accentFemale: "bg-pink-500",
    hint: "text-slate-500",
    label: "text-slate-800",
  },
  Voyager: {
    shell: "border-amber-900/20 bg-amber-50/92 shadow-xl backdrop-blur-md",
    title: "text-amber-950",
    body: "text-amber-900/80",
    stat: "text-amber-950",
    accentMale: "bg-blue-600",
    accentFemale: "bg-pink-500",
    hint: "text-amber-900/65",
    label: "text-amber-950",
  },
};

export function TrafficAccidentsPanel({
  mapStyle,
  maleCount,
  femaleCount,
  showMen,
  showWomen,
  onShowMenChange,
  onShowWomenChange,
}: Props) {
  const t = PANEL_THEME[mapStyle];

  return (
    <div
      className={`select-text rounded-2xl border p-3 text-sm ${t.shell}`}
      role="region"
      aria-label="Traffic accidents dataset and filters"
    >
      <h3 className={`mb-1.5 font-semibold leading-tight ${t.title}`}>
        About the data
      </h3>
      <p className={`mb-3 leading-snug ${t.body}`}>
        Records of traffic accidents in Cabo Verde. Point color follows the sex
        field in the dataset (blue: male, pink: female). Counts below match the
        number of records loaded via the sidebar slider.
      </p>

      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.accentMale}`} />
          <span className={t.stat}>
            Male:{" "}
            <span className="tabular-nums font-medium">
              {maleCount.toLocaleString("pt-PT")}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.accentFemale}`} />
          <span className={t.stat}>
            Female:{" "}
            <span className="tabular-nums font-medium">
              {femaleCount.toLocaleString("pt-PT")}
            </span>
          </span>
        </div>
      </div>

      <p className={`mb-2 text-xs ${t.hint}`}>Show on map</p>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="scatter-filter-men"
            checked={showMen}
            onCheckedChange={(v) => onShowMenChange(v === true)}
          />
          <Label
            htmlFor="scatter-filter-men"
            className={`cursor-pointer text-sm font-normal ${t.label}`}
          >
            Men Data
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="scatter-filter-women"
            checked={showWomen}
            onCheckedChange={(v) => onShowWomenChange(v === true)}
          />
          <Label
            htmlFor="scatter-filter-women"
            className={`cursor-pointer text-sm font-normal ${t.label}`}
          >
            Women Data
          </Label>
        </div>
      </div>
    </div>
  );
}
