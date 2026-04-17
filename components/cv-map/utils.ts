"use client";

import { caboverde } from "@/lib/caboverde";
import type {
  ClusterIconPoint,
  ExpandedIconPoint,
  IconDefinition,
  MarkerPoint,
  Position,
  ScatterPoint,
} from "@/components/cv-map/types";

type MunicipalityFeature = (typeof caboverde.features)[number];

function flattenCoordinates(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  if (value.length === 0) return [];

  if (
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  ) {
    return [value as number[]];
  }

  return value.flatMap((child) => flattenCoordinates(child));
}

function pointInRing(point: Position, ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInPolygon(point: Position, polygon: number[][][]): boolean {
  if (polygon.length === 0) return false;
  if (!pointInRing(point, polygon[0])) return false;

  for (let i = 1; i < polygon.length; i += 1) {
    if (pointInRing(point, polygon[i])) return false;
  }
  return true;
}

function pointInFeature(point: Position, feature: MunicipalityFeature): boolean {
  const geometry = feature.geometry as {
    type: string;
    coordinates: unknown;
  };

  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates as number[][][]);
  }

  if (geometry.type === "MultiPolygon") {
    const multiPolygons = geometry.coordinates as unknown as number[][][][];
    return multiPolygons.some((polygon) => pointInPolygon(point, polygon));
  }

  return false;
}

function geometryBoundingBox(feature: MunicipalityFeature) {
  const coords = flattenCoordinates(feature.geometry.coordinates);
  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const coord of coords) {
    minLng = Math.min(minLng, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLng = Math.max(maxLng, coord[0]);
    maxLat = Math.max(maxLat, coord[1]);
  }

  return { minLng, minLat, maxLng, maxLat };
}

export function municipalityCenter(feature: MunicipalityFeature): Position {
  const coords = flattenCoordinates(feature.geometry.coordinates);
  const total = coords.length || 1;
  let lng = 0;
  let lat = 0;

  for (const coord of coords) {
    lng += coord[0] ?? 0;
    lat += coord[1] ?? 0;
  }

  return [lng / total, lat / total];
}

export function hashToUnit(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return (hash % 1000) / 1000;
}

export function hexToRgb(hex: string): [number, number, number] {
  const parsed = hex.replace("#", "");
  const normalized =
    parsed.length === 3
      ? `${parsed[0]}${parsed[0]}${parsed[1]}${parsed[1]}${parsed[2]}${parsed[2]}`
      : parsed;
  const int = Number.parseInt(normalized, 16);

  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createPinIconDataUrl(color: string) {
  const svg = `
  <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd">
      <path d="M40 6C26.2 6 15 17.2 15 31c0 17.8 22.4 40.2 24.4 42.2.4.4 1 .8 1.6.8s1.2-.4 1.6-.8C44.6 71.2 67 48.8 67 31 67 17.2 55.8 6 42 6h-2z" fill="${color}" stroke="#ffffff" stroke-width="4"/>
      <circle cx="40" cy="31" r="9" fill="#ffffff"/>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createCountPinIconDataUrl(color: string, label: string) {
  const safeLabel = label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
  <svg width="110" height="110" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd">
      <path d="M55 8C36 8 20.5 23.5 20.5 42.5c0 24.5 30.8 55.3 33.6 58.1.6.6 1.4 1.1 2.2 1.1s1.6-.5 2.2-1.1C61.2 97.8 92 67 92 42.5 92 23.5 76.5 8 57.5 8H55z" fill="${color}" stroke="#ffffff" stroke-width="5"/>
      <text x="55" y="45" text-anchor="middle" dominant-baseline="middle" fill="#111827" font-family="Arial, sans-serif" font-size="24" font-weight="700">${safeLabel}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function countToLabel(count: number) {
  if (count >= 100) return "100+";
  if (count >= 50) return "50+";
  if (count >= 10) return "10+";
  return `${count}`;
}

export function buildMarkerPoints(): MarkerPoint[] {
  return caboverde.features.map((feature) => ({
    name: feature.properties.NAME_1,
    position: municipalityCenter(feature),
  }));
}

export function buildScatterPoints(pointsPerMunicipality: number): ScatterPoint[] {
  const points: ScatterPoint[] = [];

  for (const feature of caboverde.features) {
    const center = municipalityCenter(feature);
    const name = feature.properties.NAME_1;
    const bbox = geometryBoundingBox(feature);

    for (let i = 0; i < pointsPerMunicipality; i += 1) {
      const seed = `${name}-${i}`;
      const value = 20 + Math.round(hashToUnit(`${seed}-val`) * 80);
      let candidate: Position = center;
      let found = false;

      for (let attempt = 0; attempt < 18; attempt += 1) {
        const lngUnit = hashToUnit(`${seed}-lng-${attempt}`);
        const latUnit = hashToUnit(`${seed}-lat-${attempt}`);
        candidate = [
          bbox.minLng + lngUnit * (bbox.maxLng - bbox.minLng),
          bbox.minLat + latUnit * (bbox.maxLat - bbox.minLat),
        ];

        if (pointInFeature(candidate, feature)) {
          found = true;
          break;
        }
      }

      if (!found) {
        candidate = center;
      }

      points.push({
        municipality: name,
        value,
        position: candidate,
      });
    }
  }

  return points;
}

export function buildClusterIconPoints(
  markerPoints: MarkerPoint[],
  iconColor: string,
  pointsPerMunicipality: number
): ClusterIconPoint[] {
  return markerPoints.map((point) => {
    const intensity = 0.5 + hashToUnit(`cluster-${point.name}`) * 1.8;
    const count = Math.max(1, Math.round(pointsPerMunicipality * intensity));
    const label = countToLabel(count);
    const icon: IconDefinition = {
      id: `pin-cluster-${label}-${iconColor}`,
      url: createCountPinIconDataUrl(iconColor, label),
      width: 110,
      height: 110,
      anchorY: 100,
    };

    return {
      name: point.name,
      position: point.position,
      count,
      icon,
    };
  });
}

export function buildExpandedIconPoints(
  markerPoints: MarkerPoint[],
  iconColor: string,
  pointsPerMunicipality: number
): ExpandedIconPoint[] {
  const points: ExpandedIconPoint[] = [];
  const icon = createPinIconDataUrl(iconColor);

  for (const center of markerPoints) {
    for (let i = 0; i < pointsPerMunicipality; i += 1) {
      const seed = `${center.name}-icon-${i}`;
      const angle = hashToUnit(`${seed}-a`) * Math.PI * 2;
      const radius = 0.008 + hashToUnit(`${seed}-r`) * 0.02;
      const lngOffset = Math.cos(angle) * radius;
      const latOffset = Math.sin(angle) * radius * 0.8;

      points.push({
        name: `${center.name} #${i + 1}`,
        municipality: center.name,
        center: center.position,
        offset: [lngOffset, latOffset],
        icon: {
          id: "pin-single",
          url: icon,
          width: 80,
          height: 80,
          anchorY: 80,
        },
      });
    }
  }

  return points;
}
