"use client";

import type { PickingInfo } from "@deck.gl/core";

export function getMapTooltip(info: PickingInfo<any>) {
  const object = info.object;
  if (!object) return null;

  if (Array.isArray(object.points)) {
    return `Hexagono\nPontos agregados: ${object.points.length}`;
  }

  if ("municipality" in object && "value" in object) {
    return `Scatter\nMunicipio: ${object.municipality}\nValor: ${object.value}`;
  }

  if ("count" in object) {
    return `Cluster\nMunicipio: ${object.name}\nTotal: ${object.count}`;
  }

  if ("municipality" in object) {
    return `Icon\nMunicipio: ${object.municipality}`;
  }

  if ("name" in object) {
    return `Marker\nMunicipio: ${object.name}`;
  }

  return null;
}
