"use client"

import { useAppStore } from "@/store/appStore";
import type { PointDTO } from "@/types/types";
import { getTruckColorName, getRouteStrokeColor } from "@/utils/colorUtils";

interface RouteLayerProps {
  GRID_SIZE: number;
}

export function RouteLayer({ GRID_SIZE }: RouteLayerProps) {
  const camionesSimulacion = useAppStore((state) => state.simulationData.camiones);
  const camionesOperacional = useAppStore((state) => state.operationalData.camiones);
  const mode = useAppStore((state) => state.mode);

  const camiones = mode === 'simulation' ? camionesSimulacion : camionesOperacional;

  const mapPointsToString = (points: PointDTO[]): string => {
    return points
      .map(p => `${(p.x-1) * GRID_SIZE + GRID_SIZE / 2 },${(p.y-1) * GRID_SIZE + GRID_SIZE / 2}`)
      .join(' ');
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      {camiones.map((truck) => {
        if (!truck.ruta || truck.ruta.length < 2) {
          return null;
        }

        const colorName = getTruckColorName(truck.id);
        const strokeColor = getRouteStrokeColor(colorName);
        return (
          <polyline
            key={`route-${truck.id}`}
            points={mapPointsToString(truck.ruta)}
            fill="none"
            stroke={strokeColor}
            strokeWidth={3}
            strokeDasharray="5 5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}