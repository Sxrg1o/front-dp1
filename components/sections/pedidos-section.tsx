"use client"

import { useState } from "react"
import { Plus, Filter, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const mockPedidos = [
  { id: "P001", cliente: "Cliente A", fechaEntrega: "2025-01-15 10:00", estado: "Pendiente", volumen: 25 },
  { id: "P002", cliente: "Cliente B", fechaEntrega: "2025-01-15 14:30", estado: "En proceso", volumen: 15 },
  { id: "P003", cliente: "Cliente C", fechaEntrega: "2025-01-16 09:00", estado: "Entregado", volumen: 30 },
  { id: "P004", cliente: "Cliente A", fechaEntrega: "2025-01-16 16:00", estado: "Pendiente", volumen: 20 },
]

export function PedidosSection() {
  const [filtroCliente, setFiltroCliente] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("Todos los estados")
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<"single" | "multiple" | null>(null)

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Pendiente: "destructive",
      "En proceso": "default",
      Entregado: "secondary",
    } as const

    return <Badge variant={variants[estado as keyof typeof variants] || "default"}>{estado}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir Pedido</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={addType === "single" ? "default" : "outline"}
                  onClick={() => setAddType("single")}
                  className="h-20 flex-col"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  Uno
                </Button>
                <Button
                  variant={addType === "multiple" ? "default" : "outline"}
                  onClick={() => setAddType("multiple")}
                  className="h-20 flex-col"
                >
                  <Upload className="h-6 w-6 mb-2" />
                  Varios
                </Button>
              </div>

              {addType === "single" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cliente" className="py-1">Cliente</Label>
                    <Input id="cliente" placeholder="Nombre del cliente" />
                  </div>
                  <div>
                    <Label htmlFor="volumen" className="py-1">Volumen</Label>
                    <Input id="volumen" type="number" placeholder="Volumen en m³" />
                  </div>
                  <div>
                    <Label htmlFor="direccion" className="py-1">Dirección de entrega</Label>
                    <Textarea id="direccion" placeholder="Dirección completa" />
                  </div>
                  <div>
                    <Label htmlFor="fecha" className="py-1">Fecha y hora de entrega</Label>
                    <Input id="fecha" type="datetime-local" />
                  </div>
                  <Button className="w-full">Crear Pedido</Button>
                </div>
              )}

              {addType === "multiple" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="archivo" className="py-2">Subir archivo (.txt o .csv)</Label>
                    <Input id="archivo" type="file" accept=".txt,.csv" />
                  </div>
                  <Button className="w-full">Procesar Archivo</Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 ">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div className="flex-1">
              <Label htmlFor="filtro-cliente" className="py-1">Cliente</Label>
              <Input
                id="filtro-cliente"
                placeholder="Filtrar por cliente"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="filtro-estado" className="py-1">Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos los estados">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="text-center">Cliente</TableHead>
                <TableHead className="text-center">Fecha y Hora de Entrega</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Volumen (m³)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPedidos
                .filter(
                  (pedido) =>
                    pedido.cliente.toLowerCase().includes(filtroCliente.toLowerCase()) &&
                    (filtroEstado === "Todos los estados" || pedido.estado === filtroEstado),
                )
                .map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.id}</TableCell>
                    <TableCell className="text-center">{pedido.cliente}</TableCell>
                    <TableCell className="text-center">{pedido.fechaEntrega}</TableCell>
                    <TableCell className="text-center">{getEstadoBadge(pedido.estado)}</TableCell>
                    <TableCell className="text-center">{pedido.volumen}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
