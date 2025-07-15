"use client"

import { useState, useEffect, FormEvent } from "react"
import { Filter, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { pedidosService } from "@/services/pedidos-service"
import { Pedido } from "@/types/types"
import { addHours, addMinutes, set } from "date-fns"

export function PedidosSection() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroCliente, setFiltroCliente] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showPageInput, setShowPageInput] = useState(false)
  const [pageInputValue, setPageInputValue] = useState("")
  const itemsPerPage = 8
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newPedido, setNewPedido] = useState({
    idCliente: "",
    x: 0,
    y: 0,
    volumen: 1,
    horasLimite: 4,
    minutosLimite: 0
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
      } catch (error: unknown) {
        console.error('Error loading pedidos:', error)

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status: number } }
          if (axiosError.response?.status === 500) {
            setError('Error del servidor (500): No se pudieron obtener los pedidos')
          } else if (axiosError.response?.status && axiosError.response.status >= 400) {
            setError(`Error del servidor (${axiosError.response.status}): No se pudieron obtener los pedidos`)
          } else {
            setError('Error al cargar los pedidos: No se obtuvieron pedidos')
          }
        } else if (error && typeof error === 'object' && 'code' in error) {
          const networkError = error as { code?: string; message?: string }
          if (networkError.code === 'ECONNREFUSED' || networkError.message?.includes('Network Error')) {
            setError('No se pudo conectar con el servidor: No se obtuvieron pedidos')
          } else {
            setError('Error al cargar los pedidos: No se obtuvieron pedidos')
          }
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
      (pedido) => pedido.idCliente.toLowerCase().includes(filtroCliente.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPedidos = filteredPedidos.slice(startIndex, endIndex)

  const handleFilterChange = () => setCurrentPage(1)

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setNewPedido({
      ...newPedido,
      [name]: name === 'x' || name === 'y' || name === 'volumen' || name === 'horasLimite' || name === 'minutosLimite' 
        ? parseInt(value, 10) || 0 
        : value
    });
    
    // Clear the error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validate client ID
    if (!newPedido.idCliente.trim()) {
      errors.idCliente = "El ID del cliente es obligatorio";
    }
    
    // Validate coordinates
    if (newPedido.x < 0 || newPedido.x > 70) {
      errors.x = "La coordenada X debe estar entre 0 y 70";
    }
    
    if (newPedido.y < 0 || newPedido.y > 70) {
      errors.y = "La coordenada Y debe estar entre 0 y 70";
    }
    
    // Validate volume
    if (newPedido.volumen <= 0) {
      errors.volumen = "El volumen debe ser un número positivo";
    }
    
    // Validate time limit
    const totalMinutes = newPedido.horasLimite * 60 + newPedido.minutosLimite;
    if (totalMinutes < 240) { // 4 hours = 240 minutes
      errors.horasLimite = "El tiempo límite no puede ser menor a 4 horas";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPedido = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Obtener la fecha y hora actual
      const now = new Date();
      
      // Añadir las horas y minutos límite al tiempo actual
      let fechaLimite = addMinutes(addHours(now, newPedido.horasLimite), newPedido.minutosLimite);
      
      // Restar 5 horas para el ajuste con Java
      fechaLimite = addHours(fechaLimite, -5);
      
      // Establecer segundos y milisegundos a 0
      fechaLimite = set(fechaLimite, {
        seconds: 0,
        milliseconds: 0
      });
      
      // Convertir a ISO string para enviar al backend
      const tiempoLimite = fechaLimite.toISOString();
      
      const pedidoToCreate = {
        idCliente: newPedido.idCliente,
        x: newPedido.x,
        y: newPedido.y,
        volumen: newPedido.volumen,
        tiempoLimite: tiempoLimite
      };
      
      await pedidosService.create(pedidoToCreate);
      
      // Refresh the list
      const updatedPedidos = await pedidosService.getAll();
      setPedidos(updatedPedidos);
      
      // Reset form and close dialog
      setNewPedido({
        idCliente: "",
        x: 0,
        y: 0,
        volumen: 1,
        horasLimite: 4,
        minutosLimite: 0
      });
      setIsDialogOpen(false);
      setError(null);
      
    } catch (error: unknown) {
      console.error('Error al crear pedido:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: any } };
        if (axiosError.response?.data?.message) {
          setError(`Error: ${axiosError.response.data.message}`);
        } else if (axiosError.response?.status === 500) {
          setError('Error del servidor: No se pudo crear el pedido');
        } else if (axiosError.response?.status && axiosError.response.status >= 400) {
          setError(`Error del servidor (${axiosError.response.status}): No se pudo crear el pedido`);
        } else {
          setError('Error al crear el pedido');
        }
      } else {
        setError('Error al crear el pedido');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" /> Ingresar Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ingresar Nuevo Pedido</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitPedido} className="space-y-4">
              <div>
                <Label htmlFor="idCliente" className="py-2">ID Cliente</Label>
                <Input
                  id="idCliente"
                  name="idCliente"
                  value={newPedido.idCliente}
                  onChange={handleFormChange}
                  placeholder="Ingrese ID del cliente"
                  className={formErrors.idCliente ? "border-red-500" : ""}
                  required
                />
                {formErrors.idCliente && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.idCliente}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x" className="py-2">Coordenada X</Label>
                  <Input
                    id="x"
                    name="x"
                    type="number"
                    min={0}
                    max={70}
                    value={newPedido.x}
                    onChange={handleFormChange}
                    className={formErrors.x ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.x && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.x}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="y" className="py-2">Coordenada Y</Label>
                  <Input
                    id="y"
                    name="y"
                    type="number"
                    min={0}
                    max={70}
                    value={newPedido.y}
                    onChange={handleFormChange}
                    className={formErrors.y ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.y && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.y}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="volumen" className="py-2">Volumen (m³)</Label>
                <Input
                  id="volumen"
                  name="volumen"
                  type="number"
                  min={1}
                  value={newPedido.volumen}
                  onChange={handleFormChange}
                  className={formErrors.volumen ? "border-red-500" : ""}
                  required
                />
                {formErrors.volumen && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.volumen}</p>
                )}
              </div>
              
              <div>
                <Label className="py-2">Plazo de entrega (mínimo 4 horas desde ahora)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horasLimite" className="text-xs text-gray-500">Horas</Label>
                    <Input
                      id="horasLimite"
                      name="horasLimite"
                      type="number"
                      min={0}
                      max={23}
                      value={newPedido.horasLimite}
                      onChange={handleFormChange}
                      className={formErrors.horasLimite ? "border-red-500" : ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minutosLimite" className="text-xs text-gray-500">Minutos</Label>
                    <Input
                      id="minutosLimite"
                      name="minutosLimite"
                      type="number"
                      min={0}
                      max={59}
                      value={newPedido.minutosLimite}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">El pedido deberá ser entregado dentro de este plazo desde ahora.</p>
                {formErrors.horasLimite && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.horasLimite}</p>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Pedido'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filtros
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
                <div className="text-center py-8 text-lg">Cargando pedidos...</div>
            ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
            ) : pedidos.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No se encontraron pedidos</div>
            ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">Cliente</TableHead>
                        <TableHead className="text-center">Coordenadas</TableHead>
                        <TableHead className="text-center">Volumen</TableHead>
                        <TableHead className="text-center">Tiempo Creación</TableHead>
                        <TableHead className="text-center">Tiempo Límite</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPedidos.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-center">{p.id}</TableCell>
                            <TableCell className="text-center">{p.idCliente}</TableCell>
                            <TableCell className="text-center">({p.x}, {p.y})</TableCell>
                            <TableCell className="text-center">{p.volumen} m³</TableCell>
                            <TableCell className="text-center">{p.tiempoCreacion}</TableCell>
                            <TableCell className="text-center">{p.tiempoLimite}</TableCell>
                            <TableCell className="text-center">
                              {p.atendido ? '✅ Atendido' : p.descartado ? '❌ Descartado' : '🕒 Pendiente'}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>

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
                            <ChevronLeft className="h-4 w-4" /> Anterior
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
                                              if (e.key === 'Escape') handlePageInputCancel()
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
                            Siguiente <ChevronRight className="h-4 w-4" />
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
