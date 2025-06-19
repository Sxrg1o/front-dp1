import { MapPin } from "lucide-react"
import type { PedidoDTO } from "@/types/types"
import { useAppStore } from "@/store/appStore" // Importar el store global

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
  )
  
  // Filtrar los pedidos para mostrar solo los no atendidos
  const pendingPedidos = pedidos.filter(p => !p.atendido)

  return (
    <>
      {pendingPedidos.map((p) => (
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