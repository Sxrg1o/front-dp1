"use client"

import { useState } from "react"
import { Plus, Filter, Upload, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const mockCamiones = [
  {
    id: "C001",
    placa: "ABC-123",
    tipo: "Pequeño",
    proxMantenimiento: "2025-02-15",
    capacidad: 15,
    estado: "Operativo",
  },
  {
    id: "C002",
    placa: "DEF-456",
    tipo: "Mediano",
    proxMantenimiento: "2025-03-01",
    capacidad: 25,
    estado: "Mantenimiento",
  },
  { id: "C003", placa: "GHI-789", tipo: "Grande", proxMantenimiento: "2025-02-28", capacidad: 35, estado: "Operativo" },
  { id: "C004", placa: "JKL-012", tipo: "Pequeño", proxMantenimiento: "2025-01-30", capacidad: 15, estado: "Averiado" },
]

export function CamionesSection() {
  const [filtroId, setFiltroId] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("Todos los tipos")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [addType, setAddType] = useState<"single" | "multiple" | null>(null)

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Operativo: "secondary",
      Mantenimiento: "default",
      Averiado: "destructive",
    } as const

    return <Badge variant={variants[estado as keyof typeof variants] || "default"}>{estado}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Camiones</h1>
        <div className="flex gap-2">
          <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wrench className="h-4 w-4 mr-2" />
                Añadir Mantenimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Añadir Mantenimiento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="archivo-mantenimiento">Subir archivo de mantenimiento</Label>
                  <Input id="archivo-mantenimiento" type="file" />
                </div>
                <Button className="w-full">Procesar Archivo</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Camión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Añadir Camión</DialogTitle>
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
                      <Label htmlFor="placa">Placa</Label>
                      <Input id="placa" placeholder="ABC-123" />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pequeño">Pequeño</SelectItem>
                          <SelectItem value="Mediano">Mediano</SelectItem>
                          <SelectItem value="Grande">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Crear Camión</Button>
                  </div>
                )}

                {addType === "multiple" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="archivo">Subir archivo (.txt o .csv)</Label>
                      <Input id="archivo" type="file" accept=".txt,.csv" />
                    </div>
                    <Button className="w-full">Procesar Archivo</Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="filtro-id">ID</Label>
              <Input
                id="filtro-id"
                placeholder="Filtrar por ID"
                value={filtroId}
                onChange={(e) => setFiltroId(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="filtro-tipo">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos los tipos">Todos los tipos</SelectItem>
                  <SelectItem value="Pequeño">Pequeño</SelectItem>
                  <SelectItem value="Mediano">Mediano</SelectItem>
                  <SelectItem value="Grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Camiones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="text-center">Placa</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Próx. Mantenimiento</TableHead>
                <TableHead className="text-center">Capacidad (m³)</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCamiones
                .filter(
                  (camion) =>
                    camion.id.toLowerCase().includes(filtroId.toLowerCase()) &&
                    (filtroTipo === "Todos los tipos" || camion.tipo === filtroTipo),
                )
                .map((camion) => (
                  <TableRow key={camion.id}>
                    <TableCell className="font-medium">{camion.id}</TableCell>
                    <TableCell className="text-center">{camion.placa}</TableCell>
                    <TableCell className="text-center">{camion.tipo}</TableCell>
                    <TableCell className="text-center">{camion.proxMantenimiento}</TableCell>
                    <TableCell className="text-center">{camion.capacidad}</TableCell>
                    <TableCell className="text-center">{getEstadoBadge(camion.estado)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
