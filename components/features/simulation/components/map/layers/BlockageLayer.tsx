import type { BloqueoDTO } from "@/types/types"

interface BlockageLayerProps {
  bloqueos: BloqueoDTO[]
  tiempoActual: number
  GRID_SIZE: number
  GRID_COLS: number
  GRID_ROWS: number
}

export function BlockageLayer({ 
  bloqueos, 
  tiempoActual, 
  GRID_SIZE, 
  GRID_COLS, 
  GRID_ROWS 
}: BlockageLayerProps) {
  // Calculate active blockages based on current time
  const activeBlockages = bloqueos.filter(
    (b) => tiempoActual >= b.tiempoInicio && tiempoActual < b.tiempoFin
  )

  return (
    <>
      {/* Bloqueos dinámicos como cuadrados */}
      {activeBlockages.map((b) =>
        b.nodes.map((pt, idx) => (
          <div
            key={`${b.id}-${idx}`}
            className="absolute bg-red-500 pointer-events-none"
            style={{
              left: `${pt.x * GRID_SIZE + 1}px`,
              top: `${pt.y * GRID_SIZE + 1}px`,
              width: `${GRID_SIZE}px`,
              height: `${GRID_SIZE}px`,
            }}
            title={`${b.description} [t=${b.tiempoInicio}-${b.tiempoFin})`}
          />
        ))
      )}

      {/* SVG overlay para líneas de bloqueo */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ width: `${GRID_SIZE * GRID_COLS}px`, height: `${GRID_SIZE * GRID_ROWS}px` }}
      >
        {activeBlockages.map((b) =>
          b.nodes.slice(0, -1).map((pt, i) => {
            const next = b.nodes[i + 1]
            const x1 = pt.x * GRID_SIZE + GRID_SIZE / 2
            const y1 = pt.y * GRID_SIZE + GRID_SIZE / 2
            const x2 = next.x * GRID_SIZE + GRID_SIZE / 2
            const y2 = next.y * GRID_SIZE + GRID_SIZE / 2
            return (
              <line
                key={`${b.id}-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="red"
                strokeWidth={2}
              />
            )
          })
        )}
      </svg>
    </>
  )
}
