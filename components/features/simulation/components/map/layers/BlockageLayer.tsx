import type { BloqueoDTO } from "@/types/types"
import { useAppStore } from "@/store/appStore"

interface BlockageLayerProps {
  GRID_SIZE: number
  GRID_COLS: number
  GRID_ROWS: number
}

export function BlockageLayer({
  GRID_SIZE,
  GRID_COLS,
  GRID_ROWS
}: BlockageLayerProps) {
  const mode = useAppStore((state) => state.mode);
  
  const allBlockages = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.bloqueos 
      : state.operationalData.bloqueos
  );

  return (
    <>
      {allBlockages.map((b) =>
        b.nodes.map((pt, idx) => (
          <div
            key={`${b.id}-${idx}`}
            className="absolute bg-red-500 pointer-events-none"
            style={{
              left: `${(pt.x ) * GRID_SIZE}px`,
              top: `${(pt.y) * GRID_SIZE}px`,
              width: `${GRID_SIZE}px`,
              height: `${GRID_SIZE}px`,
            }}
            title={`${b.description} [Activo]`}
          />
        ))
      )}

      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ width: `${GRID_SIZE * GRID_COLS}px`, height: `${GRID_SIZE * GRID_ROWS}px` }}
      >
        {allBlockages.map((b) =>
          b.nodes.slice(0, -1).map((pt, i) => {
            const next = b.nodes?.[i + 1]; 
            if (!next) return null; 
            const x1 = (pt.x) * GRID_SIZE + GRID_SIZE / 2;
            const y1 = (pt.y) * GRID_SIZE + GRID_SIZE / 2;
            const x2 = (next.x) * GRID_SIZE + GRID_SIZE / 2;
            const y2 = (next.y) * GRID_SIZE + GRID_SIZE / 2;
            return (
              <line
                key={`${b.id}-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(239, 68, 68, 1)"
                strokeWidth={3}
                strokeDasharray="4 2"
              />
            );
          })
        )}
      </svg>
    </>
  );
}