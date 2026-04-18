/**
 * Redistributes accident records across random municipalities with positions
 * inside each municipality polygon (GADM data from lib/caboverde).
 *
 * Run: npx tsx scripts/redistribute-traffic-accidents.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { caboverde } from "../lib/caboverde";

type Position = [number, number];

type AccidentRow = {
  id: string;
  municipality: string;
  location: string;
  sex: string;
  value: number;
  position: Position;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NAME_1_TO_LABEL: Record<string, string> = {
  BoaVista: "Boavista",
  Brava: "Brava",
  Maio: "Maio",
  Mosteiros: "Mosteiros",
  "Paúl": "Paul",
  PortoNovo: "Porto Novo",
  Praia: "Praia",
  RibeiraBrava: "Ribeira Brava",
  RibeiraGrande: "Ribeira Grande",
  RibeiraGrandedeSantiago: "Ribeira Grande Santiago",
  Sal: "Sal",
  SantaCatarina: "Santa Catarina",
  SantaCatarinadoFogo: "Santa Catarina do Fogo",
  SantaCruz: "Santa Cruz",
  SãoDomingos: "São Domingos",
  SãoFilipe: "São Filipe",
  SãoLourençodosÓrgãos: "São Lourenço dos Órgãos",
  SãoMiguel: "São Miguel",
  SãoSalvadordoMundo: "São Salvador do Mundo",
  SãoVicente: "São Vicente",
  Tarrafal: "Tarrafal",
  TarrafaldeSãoNicolau: "Tarrafal de São Nicolau",
};

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
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;
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

function pointInFeature(
  point: Position,
  feature: (typeof caboverde.features)[number]
): boolean {
  const geometry = feature.geometry as {
    type: string;
    coordinates: unknown;
  };
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates as number[][][]);
  }
  if (geometry.type === "MultiPolygon") {
    const multiPolygons = geometry.coordinates as number[][][][];
    return multiPolygons.some((polygon) => pointInPolygon(point, polygon));
  }
  return false;
}

function geometryBoundingBox(feature: (typeof caboverde.features)[number]) {
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

function municipalityCenter(feature: (typeof caboverde.features)[number]): Position {
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

function hashToUnit(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return (hash % 1000) / 1000;
}

function randomPointInMunicipality(
  feature: (typeof caboverde.features)[number],
  seed: string
): Position {
  const center = municipalityCenter(feature);
  const bbox = geometryBoundingBox(feature);
  const name = String(feature.properties.NAME_1);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const lngUnit = hashToUnit(`${seed}-lng-${attempt}`);
    const latUnit = hashToUnit(`${seed}-lat-${attempt}`);
    const candidate: Position = [
      bbox.minLng + lngUnit * (bbox.maxLng - bbox.minLng),
      bbox.minLat + latUnit * (bbox.maxLat - bbox.minLat),
    ];
    if (pointInFeature(candidate, feature)) {
      return candidate;
    }
  }

  return center;
}

function pickMunicipalityIndex(seed: string, featureCount: number): number {
  const u = hashToUnit(`${seed}-mun`);
  return Math.min(featureCount - 1, Math.floor(u * featureCount));
}

function main() {
  const features = caboverde.features;
  const inputPath = path.join(__dirname, "../data/traffic-accidents-scatter.json");
  const raw = fs.readFileSync(inputPath, "utf8");
  const rows = JSON.parse(raw) as AccidentRow[];

  const out: AccidentRow[] = rows.map((row) => {
    const idx = pickMunicipalityIndex(row.id, features.length);
    const feature = features[idx];
    const name1 = String(feature.properties.NAME_1);
    const label = NAME_1_TO_LABEL[name1] ?? name1;
    const position = randomPointInMunicipality(feature, row.id);

    return {
      ...row,
      municipality: label,
      position,
    };
  });

  fs.writeFileSync(inputPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Updated ${out.length} records in ${inputPath}`);
}

main();
