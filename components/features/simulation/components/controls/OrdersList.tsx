"use client"

import { useState } from "react"
import { PedidoDTO } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"

interface OrdersListProps {
  pedidos: PedidoDTO[]
}

export function OrdersList({ pedidos }: OrdersListProps) {
  const [searchOrder, setSearchOrder] = useState("")

  const getPedidoBadge = (atendido: boolean) => {
    return <Badge variant={atendido ? "secondary" : "destructive"}>{atendido ? "Atendido" : "Pendiente"}</Badge>
  }

  const filteredOrders = pedidos.filter((order) =>
    order.id.toString().includes(searchOrder.toLowerCase()) ||
    order.idCliente.toLowerCase().includes(searchOrder.toLowerCase())
  )

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
                <TableHead className="text-xs text-center">Cliente</TableHead>
                <TableHead className="text-xs text-center">Cant.</TableHead>
                <TableHead className="text-xs text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-xs font-medium">{order.id}</TableCell>
                  <TableCell className="text-xs text-center">{order.idCliente}</TableCell>
                  <TableCell className="text-xs text-center">{order.volumen}</TableCell>
                  <TableCell className="text-xs text-center">{getPedidoBadge(order.atendido)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-gray-500 text-center">
          {filteredOrders.length} de {pedidos.length} pedidos
        </div>
      </div>
    </TabsContent>
  )
}
