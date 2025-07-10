import { MapPin } from "lucide-react"
import type { PedidoDTO } from "@/types/types"
import { useAppStore } from "@/store/appStore"

interface OrderLayerProps {
  GRID_SIZE: number
  onOrderClick: (pedido: PedidoDTO) => void
}

export function OrderLayer({ GRID_SIZE, onOrderClick }: OrderLayerProps) {
  // Obtener el modo actual
  const mode = useAppStore((state) => state.mode);
  
  // Obtener los pedidos según el modo
  const pedidos = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.pedidos 
      : state.operationalData.pedidos
  );

  return (
    <>
      {pedidos.map((p) => (
        <div
          key={`pedido-${p.id}`}
          className="absolute z-10 flex items-center justify-center pointer-events-auto cursor-pointer transition-opacity duration-500"
          style={{
            top: `${(p.y - 1) * GRID_SIZE + 1}px`,
            left: `${(p.x - 1) * GRID_SIZE + 1}px`,
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
            opacity: p.atendido ? 1 : 0.5,
          }}
          onClick={() => onOrderClick(p)}
          title={`Pedido ${p.idCliente}`}
        >
          {!p.atendido && (
            <MapPin 
              // También puedes cambiar el color
              className={"text-red-600"}
              size={Math.max(12, Math.min(32, GRID_SIZE - 2))} 
            />
          )}
        </div>
      ))}
    </>
  )
}