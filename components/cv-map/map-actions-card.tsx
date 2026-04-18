"use client";

import { useMemo, useState } from "react";
import { Download, Table2, X } from "lucide-react";
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
  onDownloadMapImage: () => void;
};

export function MapActionsCard({ minFilter, maxFilter, onDownloadMapImage }: Props) {
  const [showTable, setShowTable] = useState(false);

  const filteredRows = useMemo(() => {
    return (municipiosValores as MunicipioValor[])
      .filter(
        (item) => item.total_eleitores >= minFilter && item.total_eleitores <= maxFilter
      )
      .sort((a, b) => b.total_eleitores - a.total_eleitores);
  }, [minFilter, maxFilter]);

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
            onClick={onDownloadMapImage}
            title="Baixar imagem do mapa"
            aria-label="Baixar imagem do mapa"
          >
            <Download className="h-4 w-4" />
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
