"use client"

import { useState, useEffect } from "react"
import { Filter, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { pedidosService } from "@/lib/api"
import type { Pedido } from "@/lib/api"

export function PedidosSection() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroCliente, setFiltroCliente] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showPageInput, setShowPageInput] = useState(false)
  const [pageInputValue, setPageInputValue] = useState("")
  const itemsPerPage = 8
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        console.log('DATA RECIBIDA', data)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
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
        const updatedPedidos = await pedidosService.getAll()
        setPedidos(updatedPedidos)
        setSelectedFile(null)
        setError(null)
      } else {
        setError(response.message || 'Error al procesar el archivo')
      }
    } catch (error: unknown) {
        console.error('Error loading pedidos:', error)

        if(error && typeof error === 'object' && 'response' in error) {
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" /> Cargar archivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Subir Pedidos</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="archivo" className="py-2">Archivo (.txt o .csv)</Label>
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
