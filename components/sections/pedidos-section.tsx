"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { pedidosService, Pedido } from "@/lib/api"

const mockPedidos = [
  { fechaHoraCreacion: "02/01/2025 00:24", idCliente: "c-198", posX: 16, posY: 13, volumenM3: 3, horasLimite: 4 },
  { fechaHoraCreacion: "02/01/2025 00:48", idCliente: "c-12", posX: 5, posY: 18, volumenM3: 9, horasLimite: 17 },
  { fechaHoraCreacion: "02/01/2025 01:15", idCliente: "c-245", posX: 8, posY: 22, volumenM3: 15, horasLimite: 6 },
  { fechaHoraCreacion: "02/01/2025 02:30", idCliente: "c-87", posX: 12, posY: 7, volumenM3: 7, horasLimite: 12 },
]

export function PedidosSection() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroCliente, setFiltroCliente] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<"single" | "multiple" | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPageInput, setShowPageInput] = useState(false)
  const [pageInputValue, setPageInputValue] = useState("")
  const itemsPerPage = 8

  const [formData, setFormData] = useState({
    idCliente: '',
    posX: '',
    posY: '',
    volumenM3: '',
    horasLimite: ''
  })

  useEffect(() => {
    const loadPedidos = async () => {
      try {
        setLoading(true)
        const data = await pedidosService.getAll()
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setPedidos([])
          setError('No se obtuvieron pedidos del servidor')
        } else {
          setPedidos(data)
          setError(null)
        }
      } catch (error: any) {
        console.error('Error loading pedidos:', error)
        
        if (error.response?.status === 500) {
          setError('Error del servidor (500): No se pudieron obtener los pedidos')
        } else if (error.response?.status >= 400) {
          setError(`Error del servidor (${error.response.status}): No se pudieron obtener los pedidos`)
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          setError('No se pudo conectar con el servidor: No se obtuvieron pedidos')
        } else {
          setError('Error al cargar los pedidos: No se obtuvieron pedidos')
        }
        
        setPedidos([])
      } finally {
        setLoading(false)
      }
    }

    loadPedidos()
  }, [])

  const filteredPedidos = pedidos.filter(
    (pedido) =>
      pedido.idCliente.toLowerCase().includes(filtroCliente.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPedidos = filteredPedidos.slice(startIndex, endIndex)

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleCreatePedido = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.idCliente || !formData.posX || !formData.posY || !formData.volumenM3 || !formData.horasLimite) {
      setError('Todos los campos son obligatorios')
      return
    }

    setIsSubmitting(true)
    try {
      const newPedido = await pedidosService.create({
        idCliente: formData.idCliente,
        posX: parseFloat(formData.posX),
        posY: parseFloat(formData.posY),
        volumenM3: parseFloat(formData.volumenM3),
        horasLimite: parseInt(formData.horasLimite),
      })
      
      setPedidos(prev => [...prev, newPedido])
      setFormData({ idCliente: '', posX: '', posY: '', volumenM3: '', horasLimite: '' })
      setShowAddModal(false)
      setAddType(null)
      setError(null)
    } catch (error: any) {
      console.error('Error creating pedido:', error)
      
      if (error.response?.status === 500) {
        setError('Error del servidor (500): No se pudo crear el pedido')
      } else if (error.response?.status >= 400) {
        setError(`Error del servidor (${error.response.status}): No se pudo crear el pedido`)
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('No se pudo conectar con el servidor: No se pudo crear el pedido')
      } else {
        setError('Error al crear el pedido: Verifique los datos e intente nuevamente')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Selecciona un archivo')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await pedidosService.uploadFile(selectedFile)
      
      if (response.success) {
        try {
          const updatedPedidos = await pedidosService.getAll()
          setPedidos(updatedPedidos)
          setSelectedFile(null)
          setShowAddModal(false)
          setAddType(null)
          setError(null)
        } catch (reloadError: any) {
          console.error('Error reloading pedidos after upload:', reloadError)
          setError('Archivo procesado correctamente, pero no se pudieron cargar los datos actualizados. Recargue la página.')
        }
      } else {
        setError(response.message || 'Error al procesar el archivo')
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      
      if (error.response?.status === 500) {
        setError('Error del servidor (500): No se pudo procesar el archivo')
      } else if (error.response?.status >= 400) {
        setError(`Error del servidor (${error.response.status}): No se pudo procesar el archivo`)
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('No se pudo conectar con el servidor: No se pudo subir el archivo')
      } else {
        setError('Error al subir el archivo: Verifique el formato e intente nuevamente')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleModalChange = (open: boolean) => {
    setShowAddModal(open)
    if (!open) {
      setAddType(null)
      setFormData({ idCliente: '', posX: '', posY: '', volumenM3: '', horasLimite: '' })
      setSelectedFile(null)
      setError(null)
    }
  }

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
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <Dialog open={showAddModal} onOpenChange={handleModalChange}>
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
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
                <form onSubmit={handleCreatePedido} className="space-y-4">
                  <div>
                    <Label htmlFor="idCliente" className="py-1">ID Cliente</Label>
                    <Input 
                      id="idCliente" 
                      placeholder="ID del cliente (ej: c-198)"
                      value={formData.idCliente}
                      onChange={(e) => setFormData(prev => ({ ...prev, idCliente: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="posX" className="py-1">Posición X</Label>
                      <Input 
                        id="posX" 
                        type="number" 
                        placeholder="Coordenada X"
                        value={formData.posX}
                        onChange={(e) => setFormData(prev => ({ ...prev, posX: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="posY" className="py-1">Posición Y</Label>
                      <Input 
                        id="posY" 
                        type="number" 
                        placeholder="Coordenada Y"
                        value={formData.posY}
                        onChange={(e) => setFormData(prev => ({ ...prev, posY: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="volumenM3" className="py-1">Volumen (m³)</Label>
                    <Input 
                      id="volumenM3" 
                      type="number" 
                      step="0.1"
                      placeholder="Volumen en m³"
                      value={formData.volumenM3}
                      onChange={(e) => setFormData(prev => ({ ...prev, volumenM3: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="horasLimite" className="py-1">Horas Límite</Label>
                    <Input 
                      id="horasLimite" 
                      type="number"
                      placeholder="Horas límite para entrega"
                      value={formData.horasLimite}
                      onChange={(e) => setFormData(prev => ({ ...prev, horasLimite: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear Pedido'}
                  </Button>
                </form>
              )}

              {addType === "multiple" && (
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="archivo" className="py-2">Subir archivo (.txt o .csv)</Label>
                    <Input 
                      id="archivo" 
                      type="file" 
                      accept=".txt,.csv"
                      onChange={handleFileChange}
                      required
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-500 mt-1">
                        Archivo seleccionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !selectedFile}>
                    {isSubmitting ? 'Procesando...' : 'Procesar Archivo'}
                  </Button>
                </form>
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
              <Label htmlFor="filtro-cliente" className="py-1">ID Cliente</Label>
              <Input
                id="filtro-cliente"
                placeholder="Filtrar por ID de cliente"
                value={filtroCliente}
                onChange={(e) => {
                  setFiltroCliente(e.target.value)
                  handleFilterChange()
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Cargando pedidos...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <div className="text-sm text-gray-500">
                {pedidos.length === 0 ? 'No hay pedidos disponibles' : 'Verifique la conexión con el servidor'}
              </div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-2">No se encontraron pedidos</div>
              <div className="text-sm text-gray-500">No hay pedidos registrados en el sistema</div>
            </div>
          ) : (
            <>
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID Cliente</TableHead>
                <TableHead className="text-center">Posición</TableHead>
                <TableHead className="text-center">Fecha y Hora Creación</TableHead>
                <TableHead className="text-center">Volumen (m³)</TableHead>
                <TableHead className="text-center">Horas Límite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPedidos.map((pedido, index) => (
                <TableRow key={`${pedido.idCliente}-${pedido.fechaHoraCreacion}-${index}`}>
                  <TableCell className="text-center">{pedido.idCliente}</TableCell>
                  <TableCell className="text-center">{pedido.posX}, {pedido.posY}</TableCell>
                  <TableCell className="text-center">{pedido.fechaHoraCreacion}</TableCell>
                  <TableCell className="text-center">{pedido.volumenM3}</TableCell>
                  <TableCell className="text-center">{pedido.horasLimite}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          <div className="mt-4 space-y-4">
            <div className="text-sm text-gray-600 text-center">
              Mostrando {startIndex + 1} - {Math.min(endIndex, filteredPedidos.length)} de {filteredPedidos.length} pedidos
              {filteredPedidos.length !== pedidos.length && ` (${pedidos.length} total)`}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
