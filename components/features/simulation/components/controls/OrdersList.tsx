"use client"

import { useState } from "react"
import { PedidoDTO } from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore"
import { formatSimulationTime } from "@/utils/timeUtils"
import { cn } from "@/lib/utils" // Utilidad para clases condicionales

export function OrdersList() {
  const [searchOrder, setSearchOrder] = useState("")
  const mode = useAppStore((state) => state.mode);
  
  // Obtener el estado y la acción del store
  const selectedOrderId = useAppStore((state) => state.selectedOrderId)
  const setSelectedOrderId = useAppStore((state) => state.setSelectedOrderId)
  
  // También obtenemos el action para limpiar los camiones seleccionados
  const setSelectedTruckId = useAppStore((state) => state.setSelectedTruckId)
  
  const handleRowClick = (orderId: string) => {
    // Si el pedido clickeado ya está seleccionado, lo deseleccionamos (poniendo null)
    // Si no, lo seleccionamos y limpiamos cualquier camión seleccionado.
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId)
    // Desseleccionar cualquier camión que estuviera seleccionado
    setSelectedTruckId(null)
  };

  const tiempoActual = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulation.tiempoActual 
      : state.operational.tiempoActual
  );
  
  const pedidos = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.pedidos 
      : state.operationalData.pedidos
  );
  
  const pendingPedidos = pedidos.filter(p => !p.atendido);

  const filteredOrders = pendingPedidos.filter((order) =>
    (order.id.toString().includes(searchOrder.toLowerCase()) ||
    order.idCliente.toLowerCase().includes(searchOrder.toLowerCase())) 
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const fechaLimiteA = new Date(a.tiempoLimite).getTime();
    const fechaLimiteB = new Date(b.tiempoLimite).getTime();
    const fechaActual = new Date(tiempoActual).getTime();
    
    const tiempoRestanteA = fechaLimiteA - fechaActual;
    const tiempoRestanteB = fechaLimiteB - fechaActual;

    return tiempoRestanteA - tiempoRestanteB;
  });

  return (
    <TabsContent value="pedidos" className="p-4">
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Buscar pedido..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cod.</TableHead>
                <TableHead className="text-xs text-center">Posición</TableHead>
                <TableHead className="text-xs text-center">Cant.</TableHead>
                <TableHead className="text-xs text-center">Tiempo rest.</TableHead>
                <TableHead className="text-xs text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.map((order) => {
                const fechaLimite = new Date(order.tiempoLimite).getTime();
                const fechaActual = new Date(tiempoActual).getTime();
                const tiempoRestante = !isNaN(fechaActual) && !isNaN(fechaLimite)
                  ? Math.floor((fechaLimite - fechaActual) / (1000 * 60))
                  : 0;
                const estaVencido = tiempoRestante <= 0;

                return (
                  <TableRow 
                    key={`${order.id}-${order.tiempoLimite}`}
                    onClick={() => handleRowClick(order.id.toString())}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedOrderId === order.id.toString() && "bg-muted/80" // Resaltar si está seleccionado
                    )}
                  >
                    <TableCell className="text-xs font-medium">{order.id}</TableCell>
                    <TableCell className="text-xs text-center">{order.x}, {order.y}</TableCell>
                    <TableCell className="text-xs text-center">{order.volumen}</TableCell>
                    <TableCell className={`text-xs text-center font-medium ${estaVencido ? "text-red-600" : ""}`}>
                      {estaVencido ? "00d00h00m" : formatSimulationTime(tiempoRestante)}
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      {order.enEntrega ? "En Entrega" : order.programado ? "Programado" : "Pendiente"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-gray-500 text-center">
          {filteredOrders.length} de {pendingPedidos.length} pedidos pendientes
        </div>
      </div>
    </TabsContent>
  )
}