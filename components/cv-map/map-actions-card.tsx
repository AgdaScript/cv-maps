"use client";

import { useMemo, useState } from "react";
import { FileDown, Table2, X } from "lucide-react";
import municipiosValores from "@/data/municipios-valores.json";

type MunicipioValor = {
  comissao: string;
  total_eleitores: number;
  intervalo: string;
  color: string;
};

type Props = {
  minFilter: number;
  maxFilter: number;
};

function buildTableSvg(rows: MunicipioValor[]) {
  const rowHeight = 28;
  const width = 760;
  const height = 96 + rows.length * rowHeight;

  const escapeXml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");

  const rowElements = rows
    .map((item, index) => {
      const y = 80 + index * rowHeight;
      const zebra = index % 2 === 0 ? "#10151f" : "#0b1018";

      return `
      <rect x="20" y="${y - 18}" width="720" height="${rowHeight}" fill="${zebra}" rx="8" />
      <rect x="34" y="${y - 10}" width="14" height="14" fill="${item.color}" rx="4" />
      <text x="58" y="${y}" fill="#e5e7eb" font-size="13" font-family="Arial, sans-serif">${escapeXml(item.comissao)}</text>
      <text x="420" y="${y}" fill="#9ca3af" font-size="12" font-family="Arial, sans-serif">${escapeXml(item.intervalo)}</text>
      <text x="718" y="${y}" fill="#f8fafc" font-size="13" text-anchor="end" font-family="Arial, sans-serif">${item.total_eleitores.toLocaleString("pt-PT")}</text>
      `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="header" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#05070c" />
  <rect x="20" y="20" width="720" height="44" fill="url(#header)" rx="10" />
  <text x="34" y="48" fill="#f8fafc" font-size="15" font-weight="700" font-family="Arial, sans-serif">Census Data - Municipios</text>
  <text x="58" y="76" fill="#94a3b8" font-size="12" font-family="Arial, sans-serif">Municipio</text>
  <text x="420" y="76" fill="#94a3b8" font-size="12" font-family="Arial, sans-serif">Intervalo</text>
  <text x="718" y="76" fill="#94a3b8" font-size="12" text-anchor="end" font-family="Arial, sans-serif">Total eleitores</text>
  ${rowElements}
</svg>`;
}

export function MapActionsCard({ minFilter, maxFilter }: Props) {
  const [showTable, setShowTable] = useState(false);

  const filteredRows = useMemo(() => {
    return (municipiosValores as MunicipioValor[])
      .filter(
        (item) => item.total_eleitores >= minFilter && item.total_eleitores <= maxFilter
      )
      .sort((a, b) => b.total_eleitores - a.total_eleitores);
  }, [minFilter, maxFilter]);

  const handleSaveAsSvg = () => {
    const svg = buildTableSvg(filteredRows);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "municipios-census-data.svg";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="pointer-events-auto absolute top-4 right-4 z-20 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:bg-accent"
            onClick={() => setShowTable((prev) => !prev)}
            title="Visualizar dados em tabela"
            aria-label="Visualizar dados em tabela"
          >
            <Table2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:bg-accent"
            onClick={handleSaveAsSvg}
            title="Salvar tabela em SVG"
            aria-label="Salvar tabela em SVG"
          >
            <FileDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showTable && (
        <div className="pointer-events-auto absolute top-20 right-4 z-20 w-[420px] max-w-[calc(100%-1rem)] rounded-2xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tabela de municipios</h3>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground"
              onClick={() => setShowTable(false)}
              aria-label="Fechar tabela"
              title="Fechar tabela"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
            Filtro ativo: {minFilter.toLocaleString("pt-PT")} -{" "}
            {maxFilter.toLocaleString("pt-PT")}
          </div>

          <div className="max-h-64 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background/95 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Cor</th>
                  <th className="px-2 py-2">Municipio</th>
                  <th className="px-2 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.comissao} className="border-t border-border/70">
                    <td className="px-2 py-2">
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-black/20"
                        style={{ backgroundColor: item.color }}
                      />
                    </td>
                    <td className="px-2 py-2 text-foreground">{item.comissao}</td>
                    <td className="px-2 py-2 text-foreground">
                      {item.total_eleitores.toLocaleString("pt-PT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
