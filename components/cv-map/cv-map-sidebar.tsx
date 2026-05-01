"use client";

import type { Dispatch, SetStateAction } from "react";
import { Github, Instagram, Linkedin, Music2 } from "lucide-react";
import { LayerControls } from "@/components/cv-map/layer-controls";
import { MapStyleSelector } from "@/components/cv-map/map-style-selector";
import type { MapStyleName } from "@/components/cv-map/constants";
import type { LayerOption, MapState } from "@/components/cv-map/types";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/agda-lopes/",
    Icon: Linkedin,
  },
  {
    label: "GitHub",
    href: "https://github.com/AgdaScript",
    Icon: Github,
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

export type CvMapSidebarProps = {
  mapStyle: MapStyleName;
  setMapStyle: Dispatch<SetStateAction<MapStyleName>>;
  selectedLayer: LayerOption;
  setSelectedLayer: Dispatch<SetStateAction<LayerOption>>;
  state: MapState;
  setState: Dispatch<SetStateAction<MapState>>;
};

/** Painel lateral padrão shadcn (offcanvas desktop + Sheet em telemóvel). */
export function CvMapSidebar({
  mapStyle,
  setMapStyle,
  selectedLayer,
  setSelectedLayer,
  state,
  setState,
}: CvMapSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4 sm:px-4">
        <h1 className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">
          CV Map Sandbox
        </h1>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-3 sm:gap-6 sm:px-3">
        <div className="space-y-3 px-1">
          <h2 className="text-sm font-medium text-sidebar-foreground">About Author</h2>
          <p className="text-xs leading-relaxed text-sidebar-foreground/85 sm:text-sm">
            This project is a sandbox for testing the cv-map library. Made by{" "}
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              Agda Lopes
            </span>
            .
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                aria-label={label}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <SidebarSeparator className="mx-2" />

        <MapStyleSelector mapStyle={mapStyle} setMapStyle={setMapStyle} />

        <SidebarSeparator className="mx-2" />

        <LayerControls
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          state={state}
          setState={setState}
        />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
