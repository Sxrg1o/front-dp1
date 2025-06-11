"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, Upload, Wrench, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { camionesService, Camion } from "@/lib/api"

export function CamionesSection() {
  const [camiones, setCamiones] = useState<Camion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroId, setFiltroId] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("Todos los tipos")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [addType, setAddType] = useState<"single" | "multiple" | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPageInput, setShowPageInput] = useState(false)
  const [pageInputValue, setPageInputValue] = useState("")
  const itemsPerPage = 8

  useEffect(() => {
    const fetchCamiones = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await camionesService.getAll()
        setCamiones(data)
      } catch (err) {
        setError('Error al cargar los camiones. Verifique que el servidor esté funcionando.')
        console.error('Error fetching camiones:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCamiones()
  }, [])

  const getEstadoBadge = (estado: string = "Operativo") => {
    const variants = {
      Operativo: "secondary",
      Mantenimiento: "default",
      Averiado: "destructive",
      "En ruta": "outline",
    } as const

    return <Badge variant={variants[estado as keyof typeof variants] || "default"}>{estado}</Badge>
  }

  const filteredCamiones = camiones.filter(
    (camion) =>
      camion.id.toLowerCase().includes(filtroId.toLowerCase()) &&
      (filtroTipo === "Todos los tipos" || camion.id.substring(0, 2) === filtroTipo)
  )

  const totalPages = Math.ceil(filteredCamiones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCamiones = filteredCamiones.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [filtroId, filtroTipo])

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNumber = parseInt(pageInputValue)
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
    setShowPageInput(false)
    setPageInputValue("")
  }

  const handlePageInputCancel = () => {
    setShowPageInput(false)
    setPageInputValue("")
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
                  <Label htmlFor="archivo-mantenimiento" className="py-1">Subir archivo de mantenimiento</Label>
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
                      <Label htmlFor="placa" className="py-1">Placa</Label>
                      <Input id="placa" placeholder="ABC-123" />
                    </div>
                    <div>
                      <Label htmlFor="tipo" className="py-1">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TA">TA</SelectItem>
                          <SelectItem value="TB">TB</SelectItem>
                          <SelectItem value="TC">TC</SelectItem>
                          <SelectItem value="TD">TD</SelectItem>
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
              <Label htmlFor="filtro-id" className="py-1">ID</Label>
              <Input
                id="filtro-id"
                placeholder="Filtrar por ID"
                value={filtroId}
                onChange={(e) => setFiltroId(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="filtro-tipo" className="py-1">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos los tipos">Todos los tipos</SelectItem>
                  <SelectItem value="TA">TA</SelectItem>
                  <SelectItem value="TB">TB</SelectItem>
                  <SelectItem value="TC">TC</SelectItem>
                  <SelectItem value="TD">TD</SelectItem>
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Cargando camiones...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="text-sm"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-center">Lugar</TableHead>
                  <TableHead className="text-center">Combustible</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCamiones.map((camion) => (
                  <TableRow key={camion.id}>
                    <TableCell className="font-medium">{camion.id}</TableCell>
                    <TableCell className="text-center">{camion.x}, {camion.y}</TableCell>
                    <TableCell className="text-center">{camion.combustibleDisponible}</TableCell>
                    <TableCell className="text-center">{camion.status}</TableCell>
                    <TableCell className="text-center">{camion.consumoAcumulado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && !error && (
            <div className="mt-4 space-y-4">
              <div className="text-sm text-gray-600 text-center">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredCamiones.length)} de {filteredCamiones.length} camiones
                {filteredCamiones.length !== camiones.length && ` (${camiones.length} total)`}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {totalPages <= 5 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))
                    ) : (
                      <>
                        {/* First 2 pages */}
                        {[1, 2].map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                        
                        {/* Ellipsis or Page Input */}
                        {showPageInput ? (
                          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={pageInputValue}
                              onChange={(e) => setPageInputValue(e.target.value)}
                              placeholder={`1-${totalPages}`}
                              className="w-16 h-8 text-center text-xs"
                              min="1"
                              max={totalPages}
                              autoFocus
                              onBlur={handlePageInputCancel}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  handlePageInputCancel()
                                }
                              }}
                            />
                          </form>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPageInput(true)}
                            className="w-8 h-8 p-0 text-gray-500 hover:text-gray-700"
                          >
                            ...
                          </Button>
                        )}
                        
                        {/* Last 2 pages */}
                        {[totalPages - 1, totalPages].map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
