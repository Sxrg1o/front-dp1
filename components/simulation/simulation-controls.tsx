"use client"

import { useState } from "react"
import { Play, Pause, Square, SkipForward, RotateCcw, Plus, Truck, Fuel, Home, MapPin, LineChart, SquareIcon, SquareSquareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { avanzarUnMinuto } from "@/lib/services/simulacion-service"
import {SimulacionSnapshotDTO} from "@/lib/types";

export function SimulationControls() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchVehicle, setSearchVehicle] = useState("")
  const [searchOrder, setSearchOrder] = useState("")


  const [snapshot, setSnapshot] = useState<SimulacionSnapshotDTO | null>(null)
  const mockVehicles = [
    { id: "VH001", position: "[22,04]", capacity: 25, fuelLevel: "[22,04]", status: "Operativo" },
    { id: "VH002", position: "[22,04]", capacity: 25, fuelLevel: "[22,04]", status: "En ruta" },
    { id: "VH003", position: "[22,04]", capacity: 25, fuelLevel: "[22,04]", status: "Cargando" },
    { id: "VH004", position: "[15,08]", capacity: 30, fuelLevel: "[15,08]", status: "Mantenimiento" },
    { id: "VH005", position: "[30,12]", capacity: 20, fuelLevel: "[30,12]", status: "Operativo" },
  ]

  const mockOrders = [
    { id: "27500", client: "C-20", quantity: 5, status: "Por atender"},
    { id: "27499", client: "C-10", quantity: 3, status: "Por atender"},
    { id: "27498", client: "C-09", quantity: 2, status: "En proceso"},
    { id: "27497", client: "C-15", quantity: 8, status: "Por atender"},
    { id: "27496", client: "C-19", quantity: 4, status: "Completado"},
    { id: "27495", client: "C-46", quantity: 12, status: "Por atender"},
  ]
  const handleStep = async () => {
    try {
      const nuevoEstado = await avanzarUnMinuto()
      setSnapshot(nuevoEstado)
      console.log("⏩ Nuevo estado:", nuevoEstado)
    } catch (error) {
      console.error("Error al avanzar un minuto:", error)
    }
  }
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Operativo: "secondary",
      "En ruta": "default",
      Cargando: "outline",
      Mantenimiento: "destructive",
      "Por atender": "destructive",
      "En proceso": "default",
      Completado: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }
  return (
    <Card className="h-lv py-0 gap-0">
      <CardHeader className="bg-blue-100 rounded-t-lg py-4">
        <CardTitle className="text-lg">Controles simulación</CardTitle>
        
        <div className="flex items-center gap-8">
          <Button size="sm" variant="outline" title="Reiniciar">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handlePlayPause} title={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" title="Pausar">
            <Pause className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Detener">
            <Square className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Avanzar" onClick={handleStep}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 p-3 bg-white rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-sm">Ingresar</span>
            <Select defaultValue="pedido">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pedido">Pedido</SelectItem>
                <SelectItem value="vehiculo">Vehículo</SelectItem>
                <SelectItem value="averia">Avería</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="leyenda" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none">
            <TabsTrigger value="vehiculos" className="text-sm">
              VEHÍCULOS
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="text-sm">
              PEDIDOS
            </TabsTrigger>
            <TabsTrigger value="leyenda" className="text-sm">
              LEYENDA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leyenda" className="p-4 space-y-6">

            <div>
              <h4 className="font-semibold mb-3 text-base">Vehículos</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="text-green-600 mx-auto mb-1" size={28} />
                  <div className="text-sm font-medium">Vehículo: TA</div>
                  <div className="text-xs text-gray-600">Capacidad: 25</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="text-yellow-600 mx-auto mb-1" size={28} />
                  <div className="text-sm font-medium">Vehículo: TB</div>
                  <div className="text-xs text-gray-600">Capacidad: 15</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="text-blue-600 mx-auto mb-1" size={28} />
                  <div className="text-sm font-medium">Vehículo: TC</div>
                  <div className="text-xs text-gray-600">Capacidad: 10</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="text-purple-600 mx-auto mb-1" size={28} />
                  <div className="text-sm font-medium">Vehículo: TD</div>
                  <div className="text-xs text-gray-600">Capacidad: 5</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-base">Ubicaciones</h4>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Home className="text-blue-700 mx-auto mb-1" size={28} />
                  <div className="text-sm">Planta Principal</div>
                </div>
                <div className="text-center">
                  <Fuel className="text-green-600 mx-auto mb-1" size={28} />
                  <div className="text-sm">Estaciones GLP</div>
                </div>
                <div className="text-center">
                  <MapPin className="text-red-600 mx-auto mb-1" size={28} />
                  <div className="text-sm">Puntos de Entrega</div>
                </div>
                <div className="text-center">
                  <SquareIcon className="text-red-600 mx-auto mb-1" size={28} />
                  <div className="text-sm">Bloqueos</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehiculos" className="p-4">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Buscar vehículo..."
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Cod. Vehic.</TableHead>
                      <TableHead className="text-xs text-center">Posición</TableHead>
                      <TableHead className="text-xs text-center">Cap.</TableHead>
                      <TableHead className="text-xs text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockVehicles
                      .filter((vehicle) => vehicle.id.toLowerCase().includes(searchVehicle.toLowerCase()))
                      .map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="text-xs font-medium">{vehicle.id}</TableCell>
                          <TableCell className="text-xs text-center">{vehicle.position}</TableCell>
                          <TableCell className="text-xs text-center">{vehicle.capacity}</TableCell>
                          <TableCell className="text-xs text-center">{getStatusBadge(vehicle.status)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-gray-500 text-center">
                {mockVehicles.filter((v) => v.id.toLowerCase().includes(searchVehicle.toLowerCase())).length} de{" "}
                {mockVehicles.length} vehículos
              </div>
            </div>
          </TabsContent>

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
                    {mockOrders
                      .filter(
                        (order) =>
                          order.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
                          order.client.toLowerCase().includes(searchOrder.toLowerCase()),
                      )
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="text-xs font-medium">{order.id}</TableCell>
                          <TableCell className="text-xs text-center">{order.client}</TableCell>
                          <TableCell className="text-xs text-center">{order.quantity}</TableCell>
                          <TableCell className="text-xs text-center">{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-gray-500 text-center">
                {
                  mockOrders.filter(
                    (o) =>
                      o.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
                      o.client.toLowerCase().includes(searchOrder.toLowerCase()),
                  ).length
                }{" "}
                de {mockOrders.length} pedidos
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
