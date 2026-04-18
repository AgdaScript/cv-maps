"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
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
import { MAP_STYLES } from "@/components/cv-map/constants";

type MapStyleName = keyof typeof MAP_STYLES;

type Props = {
  mapStyle: MapStyleName;
  setMapStyle: Dispatch<SetStateAction<MapStyleName>>;
};

export function MapStyleSelector({ mapStyle, setMapStyle }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mt-4 space-y-2">
      <h2 className="font-medium">Style Selector</h2>
      {/* <label className="text-sm">Estilo (dropdown)</label> */}
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {mapStyle}
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
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
