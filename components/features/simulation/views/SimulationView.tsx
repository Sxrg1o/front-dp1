"use client"

import { useState, useEffect } from "react"
import { SimulationMap } from "@/components/features/simulation/components/simulation-map"
import { SimulationControls } from "@/components/features/simulation/components/simulation-controls"
import { formatSimulationTime } from "@/utils/timeUtils"
import { 
  PedidoDTO, 
  TruckDTO, 
  TanqueDTO, 
  BloqueoDTO,
  SimulacionSnapshotDTO
} from "@/types/types"
import { 
  avanzarUnMinuto, 
  resetSimulacion,
  avanzarMultiplesMinutos,
  obtenerSnapshot 
} from "@/services/simulacion-service"

interface SimulationConfig {
  escenario: 'semanal' | 'colapso'
  fechaInicio: string
  fechaFinal?: string
}

interface SimulationViewProps {
  config: SimulationConfig;
  simulationId: string;
}

export function SimulationView({ config, simulationId }: SimulationViewProps) {
  // Estados de la simulación
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
  const [camiones, setCamiones] = useState<TruckDTO[]>([])
  const [tanques, setTanques] = useState<TanqueDTO[]>([])
  const [bloqueos, setBloqueos] = useState<BloqueoDTO[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [tiempoActual, setTiempoActual] = useState(0)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);


  // Funciones auxiliares para formateo
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTitle = () => {
    return config.escenario === 'semanal' ? 'Simulación Semanal' : 'Simulación al Colapso'
  }

  const getDateInfo = () => {
    if (config.escenario === 'semanal' && config.fechaFinal) {
      return `Fecha inicio: ${formatDate(config.fechaInicio)} - Fecha fin: ${formatDate(config.fechaFinal)}`
    } else {
      return `Fecha inicio: ${formatDate(config.fechaInicio)}`
    }
  }

  // Función para actualizar el estado de la simulación a partir de un snapshot
  const updateSimulationState = (snapshot: SimulacionSnapshotDTO) => {
    setTiempoActual(snapshot.tiempoActual);
    setCamiones(snapshot.camiones || []);
    setPedidos(snapshot.pedidos || []);
    setBloqueos(snapshot.bloqueos || []);
    const tanquesDTO: TanqueDTO[] = Array.isArray(snapshot.tanques)
      ? snapshot.tanques.map((t: TanqueDTO, idx: number) => ({
          id: t.id ?? `tanque-${idx}`,
          nombre: t.nombre ?? `Tanque ${idx + 1}`,
          posX: t.posX,
          posY: t.posY,
          capacidadTotal: t.capacidadTotal,
          capacidadDisponible: t.capacidadDisponible,
        }))
      : [];
    setTanques(tanquesDTO);
  };

  // Cargar el snapshot inicial
  useEffect(() => {
    const fetchInitialSnapshot = async () => {
      if (simulationId) {
        try {
          setIsLoadingInitialData(true);
          const snapshot = await obtenerSnapshot(simulationId);
          updateSimulationState(snapshot);
        } catch (err) {
          console.error("❌ Falló al obtener el snapshot inicial:", err);
        } finally {
          setIsLoadingInitialData(false);
        }
      }
    };
    fetchInitialSnapshot();
  }, [simulationId]);


  // Lógica de simulación (polling)
  useEffect(() => {
    if (!isRunning || isPaused || !simulationId) return

    const interval = setInterval(async () => {
      try {
        const snapshot = await avanzarUnMinuto(simulationId)
        updateSimulationState(snapshot);

        snapshot.pedidos.forEach((p) => {
          if (p.tiempoCreacion === snapshot.tiempoActual) {
            console.log(
              `🆕 Pedido ${p.id} recibido en (${p.x}, ${p.y}), ` +
              `volumen=${p.volumen} m³, límite t+${p.tiempoLimite}`
            )
          }
        })
        snapshot.bloqueos.forEach((b) => {
          if (b.tiempoInicio === snapshot.tiempoActual) {
            console.log(`⛔ Bloqueo ${b.id} comienza en t+${b.tiempoInicio}`)
          }
        })

      } catch (err) {
        console.error("❌ Falló step en frontend:", err)
        clearInterval(interval) 
        setIsRunning(false) 
      }
    }, 1000);

    return () => clearInterval(interval)
  }, [isRunning, isPaused, simulationId]); // No olvides añadirlo a las dependencias

  // Handlers para controles de simulación
  const handlePlay = async () => {
    if (!simulationId) return;

    if (!isRunning) { // Primera vez o después de stop
      try {
        // Si es la primera vez que se da play DESPUÉS de cargar la vista,
        // el snapshot inicial ya debería estar cargado.
        // Si se detuvo y se vuelve a iniciar, podríamos querer resetear o continuar.
        // Por ahora, asumimos que continuar es el comportamiento deseado si ya hay datos.
        // Si no hay datos (tiempoActual es 0), podría ser un reinicio implícito o cargar el snapshot.
        if (tiempoActual === 0 && !isLoadingInitialData) { 
            const initialSnapshot = await obtenerSnapshot(simulationId);
            updateSimulationState(initialSnapshot);
        }
        setIsRunning(true);
        setIsPaused(false);
      } catch (err) {
        console.error("❌ Error al (re)iniciar simulación:", err);
      }
    } else { // Reanudar desde pausa
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true)
    }
  }

  const handleStop = async () => {
    if (!simulationId) return;
    setIsRunning(false)
    setIsPaused(false)
    // Opcional: Resetear el estado visual inmediatamente
    // setTiempoActual(0); 
    // setPedidos([]); 
    // setCamiones([]); 
    // setTanques([]); 
    // setBloqueos([]);
    try {
      await resetSimulacion(simulationId); 
      const snapshot = await obtenerSnapshot(simulationId); 
      updateSimulationState(snapshot);
    } catch (err) {
      console.error("❌ Error al detener/resetear la simulación:", err);
    }
  }

  const handleStepForward = async () => {
    if (!simulationId || isRunning) return; 
    try {
      const snapshot = await avanzarUnMinuto(simulationId);
      updateSimulationState(snapshot);
    } catch (err) {
      console.error("❌ Error al avanzar un minuto:", err);
    }
  };

  const handleAdvanceMultipleSteps = async (steps: number) => {
    if (!simulationId || isRunning) return;
    try {
      const snapshot = await avanzarMultiplesMinutos(simulationId, steps);
      updateSimulationState(snapshot);
    } catch (err) {
      console.error(`❌ Error al avanzar ${steps} minutos:`, err);
    }
  };


  if (isLoadingInitialData && !isRunning) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl">Cargando datos de la simulación...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>{getDateInfo()}</span>
            <span>Tiempo transcurrido: {formatSimulationTime(tiempoActual)}</span>
            <span>Flota: {camiones.length} 🚛</span>
            <span>Pedidos pendientes: {pedidos.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SimulationMap 
            pedidos={pedidos}
            camiones={camiones}
            tanques={tanques}
            bloqueos={bloqueos}
            tiempoActual={tiempoActual}
            isRunning={isRunning}
            isPaused={isPaused}
          />
        </div>
        
        <div className="xl:col-span-1">
          <SimulationControls 
            pedidos={pedidos}
            camiones={camiones}
            isRunning={isRunning}
            isPaused={isPaused}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onStepForward={handleStepForward}
          />
        </div>
      </div>
    </div>
  )
}
