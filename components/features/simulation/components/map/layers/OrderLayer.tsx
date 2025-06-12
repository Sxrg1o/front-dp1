import { MapPin } from "lucide-react"
import type { PedidoDTO } from "@/types/types"

interface OrderLayerProps {
  pedidos: PedidoDTO[]
  GRID_SIZE: number
  onOrderClick: (pedido: PedidoDTO) => void
}

export function OrderLayer({ pedidos, GRID_SIZE, onOrderClick }: OrderLayerProps) {
  return (
    <>
      {pedidos.map((p) => (
        <div
          key={`pedido-${p.id}`}
          className="absolute z-10 flex items-center justify-center pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
          style={{
            top: `${p.y * GRID_SIZE + 1}px`,
            left: `${p.x * GRID_SIZE + 1}px`,
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
          }}
          onClick={() => onOrderClick(p)}
          title={`Pedido ${p.idCliente}`}
        >
          <MapPin 
            className="text-red-600"
            size={Math.max(12, Math.min(32, GRID_SIZE - 2))} 
          />
        </div>
      ))}
    </>
  )
}