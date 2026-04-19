import type { Position } from "@/components/cv-map/types";

type OsrmResponse = {
  routes?: { geometry: { coordinates: Position[] } }[];
  code?: string;
};

export async function fetchDrivingRoute(
  a: Position,
  b: Position
): Promise<Position[] | null> {
  const from = `${a[0]},${a[1]}`;
  const to = `${b[0]},${b[1]}`;
  const url = `/api/osrm?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as OsrmResponse;
  const coords = data.routes?.[0]?.geometry?.coordinates;
  if (!coords?.length) return null;
  return coords;
}
