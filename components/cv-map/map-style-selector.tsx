"use client";

import type { Dispatch, SetStateAction } from "react";
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
import { MAP_STYLES } from "@/components/cv-map/constants";

type MapStyleName = keyof typeof MAP_STYLES;

type Props = {
  mapStyle: MapStyleName;
  setMapStyle: Dispatch<SetStateAction<MapStyleName>>;
};

export function MapStyleSelector({ mapStyle, setMapStyle }: Props) {
  return (
    <section className="mt-4 space-y-2 rounded-md border border-border p-3">
      <h2 className="font-medium">Mapa Base</h2>
      <label className="text-sm">Estilo (dropdown)</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {mapStyle}
            <span className="text-xs text-muted-foreground">trocar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Estilo do mapa</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={mapStyle}
            onValueChange={(value) => setMapStyle(value as MapStyleName)}
          >
            {Object.keys(MAP_STYLES).map((style) => (
              <DropdownMenuRadioItem key={style} value={style}>
                {style}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}
