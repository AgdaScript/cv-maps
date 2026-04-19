import { NextResponse } from "next/server";

/**
 * Proxy para a API pública OSRM (evita problemas de CORS no browser).
 * GET /api/osrm?from=lng,lat&to=lng,lat
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing query params: from and to (format lng,lat)" },
      { status: 400 }
    );
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?geometries=geojson&overview=full`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to reach OSRM service" },
      { status: 502 }
    );
  }
}
