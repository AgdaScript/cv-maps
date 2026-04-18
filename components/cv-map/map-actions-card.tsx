"use client";

import { useMemo, useState } from "react";
import { Download, Table2, X } from "lucide-react";
import municipiosValores from "@/data/municipios-valores.json";
import type { MapStyleName } from "@/components/cv-map/constants";

type MunicipioValor = {
  comissao: string;
  total_eleitores: number;
  intervalo: string;
  color: string;
};

type Props = {
  minFilter: number;
  maxFilter: number;
  mapStyle: MapStyleName;
  onDownloadMapImage: () => void;
};

const ACTIONS_CARD_THEME: Record<
  MapStyleName,
  {
    shell: string;
    button: string;
    tableShell: string;
    title: string;
    search: string;
    tableBorder: string;
    head: string;
    rowText: string;
    empty: string;
  }
> = {
  Dark: {
    shell: "border-white/20 bg-slate-950/70",
    button:
      "border-white/20 bg-slate-900/80 text-slate-50 hover:bg-slate-800/90",
    tableShell: "border-white/20 bg-slate-950/88",
    title: "text-slate-100",
    search:
      "border-white/20 bg-slate-900/85 text-slate-100 placeholder:text-slate-400 focus-visible:ring-slate-300/40",
    tableBorder: "border-white/20",
    head: "bg-slate-900/95 text-slate-300",
    rowText: "text-slate-100",
    empty: "text-slate-400",
  },
  Light: {
    shell: "border-slate-900/20 bg-white/90",
    button:
      "border-slate-300 bg-white/95 text-slate-900 hover:bg-slate-100/95",
    tableShell: "border-slate-900/20 bg-white/93",
    title: "text-slate-900",
    search:
      "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-400/40",
    tableBorder: "border-slate-300",
    head: "bg-slate-100/95 text-slate-600",
    rowText: "text-slate-900",
    empty: "text-slate-500",
  },
  Voyager: {
    shell: "border-amber-900/20 bg-amber-50/92",
    button:
      "border-amber-900/25 bg-amber-50/95 text-amber-950 hover:bg-amber-100/95",
    tableShell: "border-amber-900/25 bg-amber-50/94",
    title: "text-amber-950",
    search:
      "border-amber-900/25 bg-amber-50 text-amber-950 placeholder:text-amber-900/60 focus-visible:ring-amber-700/35",
    tableBorder: "border-amber-900/25",
    head: "bg-amber-100/95 text-amber-900",
    rowText: "text-amber-950",
    empty: "text-amber-900/70",
  },
};

export function MapActionsCard({
  minFilter,
  maxFilter,
  mapStyle,
  onDownloadMapImage,
}: Props) {
  const [showTable, setShowTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = ACTIONS_CARD_THEME[mapStyle];

  const filteredRows = useMemo(() => {
    return (municipiosValores as MunicipioValor[])
      .filter(
        (item) => item.total_eleitores >= minFilter && item.total_eleitores <= maxFilter
      )
      .sort((a, b) => b.total_eleitores - a.total_eleitores);
  }, [minFilter, maxFilter]);

  const tableRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filteredRows;
    return filteredRows.filter((item) => item.comissao.toLowerCase().includes(term));
  }, [filteredRows, searchTerm]);

  const handleDownloadCsv = () => {
    const escapeCsv = (value: string) => {
      if (value.includes('"') || value.includes(",") || value.includes("\n")) {
        return `"${value.replaceAll('"', '""')}"`;
      }
      return value;
    };

    const header = ["cor", "municipio", "total_eleitores", "intervalo"];
    const rows = tableRows.map((item) => [
      item.color,
      item.comissao,
      String(item.total_eleitores),
      item.intervalo,
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "municipalities-table.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        className={`pointer-events-auto absolute top-4 right-4 z-20 rounded-2xl border p-2 shadow-lg backdrop-blur ${theme.shell}`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${theme.button}`}
            onClick={() => setShowTable((prev) => !prev)}
            title="Visualizar dados em tabela"
            aria-label="Visualizar dados em tabela"
          >
            <Table2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${theme.button}`}
            onClick={onDownloadMapImage}
            title="Baixar imagem do mapa"
            aria-label="Baixar imagem do mapa"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showTable && (
        <div
          className={`pointer-events-auto absolute top-20 right-4 z-20 w-[420px] max-w-[calc(100%-1rem)] rounded-2xl border p-3 shadow-xl backdrop-blur ${theme.tableShell}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className={`text-sm font-semibold ${theme.title}`}>Municipalities table</h3>
            <button
              type="button"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${theme.button}`}
              onClick={() => setShowTable(false)}
              aria-label="Fechar tabela"
              title="Fechar tabela"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* <div className="mb-2 rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
            Filtro ativo: {minFilter.toLocaleString("pt-PT")} -{" "}
            {maxFilter.toLocaleString("pt-PT")}
          </div> */}

          <div className="mb-2 flex items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search municipality..."
              className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 ${theme.search}`}
            />
            <button
              type="button"
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${theme.button}`}
              onClick={handleDownloadCsv}
              title="Baixar CSV da tabela"
              aria-label="Baixar CSV da tabela"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          <div className={`max-h-64 overflow-auto rounded-lg border ${theme.tableBorder}`}>
            <table className="w-full text-sm">
              <thead className={`sticky top-0 text-left text-xs ${theme.head}`}>
                <tr>
                  <th className="px-2 py-2">Cor</th>
                  <th className="px-2 py-2">Municipality</th>
                  <th className="px-2 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item) => (
                  <tr key={item.comissao} className={`border-t ${theme.tableBorder}`}>
                    <td className="px-2 py-2">
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-black/20"
                        style={{ backgroundColor: item.color }}
                      />
                    </td>
                    <td className={`px-2 py-2 ${theme.rowText}`}>{item.comissao}</td>
                    <td className={`px-2 py-2 ${theme.rowText}`}>
                      {item.total_eleitores.toLocaleString("pt-PT")}
                    </td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr>
                    <td className={`px-2 py-3 text-center text-sm ${theme.empty}`} colSpan={3}>
                      No municipality found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
