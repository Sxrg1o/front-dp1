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
  
  // Obtener el pedido seleccionado del store
  const selectedOrderId = useAppStore((state) => state.selectedOrderId);

  return (
    <>
      {pedidos.map((p) => (
        <div
          key={`pedido-${p.id}`}
          className={`absolute z-10 flex items-center justify-center pointer-events-auto cursor-pointer transition-all duration-300 ${
            selectedOrderId === p.id.toString() ? 'z-20' : 'z-10'
          }`}
          style={{
            top: `${(p.y) * GRID_SIZE + 1}px`,
            left: `${(p.x) * GRID_SIZE + 1}px`,
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
            opacity: p.atendido ? 1 : selectedOrderId === p.id.toString() ? 1 : 0.5,
            transform: selectedOrderId === p.id.toString() ? 'scale(1.2)' : 'scale(1)',
          }}
          onClick={() => onOrderClick(p)}
          title={`Pedido ${p.idCliente}`}
        >
          {!p.atendido && (
            <MapPin 
              // Aplicar color y tamaño condicional cuando está seleccionado
              className={`text-red-600 ${selectedOrderId === p.id.toString() ? 'animate-pulse' : ''}`}
              size={
                selectedOrderId === p.id.toString() 
                  ? Math.max(18, Math.min(48, GRID_SIZE))  // Más grande cuando está seleccionado
                  : Math.max(12, Math.min(32, GRID_SIZE - 2))
              }
            />
          )}
        </div>
      ))}
    </>
  )
}