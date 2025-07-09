// store/appStore.ts
import { create } from 'zustand';
import { 
  AppState, 
  AppActions,
  AppStore,
  PlaybackStatus,
} from '@/types/store';
import { AveriaDTO, SimulacionSnapshotDTO, SimulationConfig } from '@/types/types'; // Corregida importación de SimulationConfig
import { useEffect } from 'react'; // Añadida importación de useEffect
import {
  avanzarUnMinuto,
  resetSimulacion,
  avanzarMultiplesMinutos,
  obtenerSnapshot,
  addAveriaSimulacion
} from '@/services/simulacion-service';

import api from '../lib/api-client';

import { averiasService } from '@/services/averias-service';

// Estado inicial de la aplicación
const initialState: AppState = {
  mode: 'simulation', // Modo predeterminado
  simulation: {
    simulationId: null,
    config: null,
    tiempoActual: 0,
    playbackStatus: 'idle',
    loadingState: {
      isLoading: false,
      error: null
    }
  },
  operational: {
    simulationId: null,
    config: null,
    tiempoActual: 0,
    playbackStatus: 'idle',
    loadingState: {
      isLoading: false,
      error: null
    }
  },
  simulationData: {
    pedidos: [],
    camiones: [],
    tanques: [],
    bloqueos: [],
    averias: []
  },
  operationalData: {
    pedidos: [],
    camiones: [],
    tanques: [],
    bloqueos: [],
    averias: []
  },
  ui: {
    selectedEntityId: null,
    selectedEntityType: null,
    selectedTab: 'leyenda',
    isSidebarOpen: true
  }
};

// Crear el store
export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // Acciones de simulación
  setSimulationId: (id) => set((state) => ({
    simulation: { ...state.simulation, simulationId: id }
  })),

  setSimulationConfig: (config) => set((state) => ({
    simulation: { ...state.simulation, config }
  })),

  setTiempoActual: (tiempo) => set((state) => ({
    simulation: { ...state.simulation, tiempoActual: tiempo }
  })),

  setPlaybackStatus: (status) => set((state) => ({
    simulation: { ...state.simulation, playbackStatus: status }
  })),

  setLoading: (isLoading) => set((state) => ({
    simulation: { 
      ...state.simulation, 
      loadingState: { 
        ...state.simulation.loadingState, 
        isLoading 
      }
    }
  })),

  setError: (error) => set((state) => ({
    simulation: { 
      ...state.simulation, 
      loadingState: { 
        ...state.simulation.loadingState, 
        error 
      }
    }
  })),

  // Acción para establecer el modo
  setMode: (mode) => set(() => ({ mode })),

  // Acciones de datos para simulación
  setSimulationPedidos: (pedidos) => set((state) => ({
    simulationData: { ...state.simulationData, pedidos }
  })),

  setSimulationCamiones: (camiones) => set((state) => ({
    simulationData: { ...state.simulationData, camiones }
  })),

  setSimulationTanques: (tanques) => set((state) => ({
    simulationData: { ...state.simulationData, tanques }
  })),

  setSimulationBloqueos: (bloqueos) => set((state) => ({
    simulationData: { ...state.simulationData, bloqueos }
  })),
  
  // Acciones de datos para operaciones
  setOperationalPedidos: (pedidos) => set((state) => ({
    operationalData: { ...state.operationalData, pedidos }
  })),

  setOperationalCamiones: (camiones) => set((state) => ({
    operationalData: { ...state.operationalData, camiones }
  })),

  setOperationalTanques: (tanques) => set((state) => ({
    operationalData: { ...state.operationalData, tanques }
  })),

  setOperationalBloqueos: (bloqueos) => set((state) => ({
    operationalData: { ...state.operationalData, bloqueos }
  })),

  updateSimulationFromSnapshot: (snapshot) => {
    if (!snapshot) return;

    // Procesar tanques para agregar campos faltantes si es necesario
    const tanquesDTO = Array.isArray(snapshot.tanques)
      ? snapshot.tanques.map((t, idx) => ({
          id: t.id ?? `tanque-${idx}`,
          nombre: t.nombre ?? `Tanque ${idx + 1}`,
          posX: t.posX,
          posY: t.posY,
          capacidadTotal: t.capacidadTotal,
          capacidadDisponible: t.capacidadDisponible,
        }))
      : [];

    set((state) => ({
      simulation: {
        ...state.simulation,
        tiempoActual: snapshot.tiempoActual
      },
      simulationData: {
        ...state.simulationData,
        pedidos: snapshot.pedidos || [],
        camiones: snapshot.camiones || [],
        tanques: tanquesDTO,
        bloqueos: snapshot.bloqueos || [],
        averias: snapshot.averias || []
      }
    }));

    // Detectar eventos para la simulación
    if (snapshot.pedidos) {
      snapshot.pedidos.forEach((p) => {
        if (p.tiempoCreacion === snapshot.tiempoActual) {
          console.log(
            `🆕 Pedido ${p.id} recibido en (${p.x}, ${p.y}), ` +
            `volumen=${p.volumen} m³, límite t+${p.tiempoLimite}`
          );
        }
      });
    }

    if (snapshot.bloqueos) {
      snapshot.bloqueos.forEach((b) => {
        if (b.tiempoInicio === snapshot.tiempoActual) {
          console.log(`⛔ Bloqueo ${b.id} comienza en t+${b.tiempoInicio}`);
        }
      });
    }
  },

  updateOperationalFromSnapshot: (snapshot) => {
    if (!snapshot) return;

    // Procesar tanques para agregar campos faltantes si es necesario
    const tanquesDTO = Array.isArray(snapshot.tanques)
      ? snapshot.tanques.map((t, idx) => ({
          id: t.id ?? `tanque-${idx}`,
          nombre: t.nombre ?? `Tanque ${idx + 1}`,
          posX: t.posX,
          posY: t.posY,
          capacidadTotal: t.capacidadTotal,
          capacidadDisponible: t.capacidadDisponible,
        }))
      : [];

    set((state) => ({
      operational: {
        ...state.operational,
        tiempoActual: snapshot.tiempoActual
      },
      operationalData: {
        ...state.operationalData,
        pedidos: snapshot.pedidos || [],
        camiones: snapshot.camiones || [],
        tanques: tanquesDTO,
        bloqueos: snapshot.bloqueos || [],
        averias: snapshot.averias || []
      }
    }));

    // Detectar eventos (esto podría moverse a un middleware o acción específica)
    if (snapshot.pedidos) {
      snapshot.pedidos.forEach((p) => {
        if (p.tiempoCreacion === snapshot.tiempoActual) {
          console.log(
            `🆕 Pedido ${p.id} recibido en (${p.x}, ${p.y}), ` +
            `volumen=${p.volumen} m³, límite t+${p.tiempoLimite}`
          );
        }
      });
    }

    if (snapshot.bloqueos) {
      snapshot.bloqueos.forEach((b) => {
        if (b.tiempoInicio === snapshot.tiempoActual) {
          console.log(`⛔ Bloqueo ${b.id} comienza en t+${b.tiempoInicio}`);
        }
      });
    }
  },

  // Acciones de UI
  setSelectedEntity: (id, type) => set((state) => ({
    ui: { 
      ...state.ui, 
      selectedEntityId: id, 
      selectedEntityType: type 
    }
  })),

  setSelectedTab: (tab) => set((state) => ({
    ui: { ...state.ui, selectedTab: tab }
  })),

  toggleSidebar: () => set((state) => ({
    ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen }
  })),

  setSidebarOpen: (isOpen) => set((state) => ({
    ui: { ...state.ui, isSidebarOpen: isOpen }
  })),

  // Acciones de API
  initializeSimulation: async (simulationId) => {
    const { setLoading, setError, updateSimulationFromSnapshot, setSimulationId } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      setSimulationId(simulationId);
      
      const snapshot = await obtenerSnapshot(simulationId);
      updateSimulationFromSnapshot(snapshot);
    } catch (error) {
      console.error("❌ Error al inicializar la simulación:", error);
      setError("Error al cargar los datos de la simulación");
    } finally {
      setLoading(false);
    }
  },

  startSimulation: async () => {
    const { 
      simulation, 
      setPlaybackStatus, 
      setLoading, 
      setError, 
      updateSimulationFromSnapshot
    } = get();
    
    if (!simulation.simulationId) {
      console.error("No hay un ID de simulación activo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Si es la primera vez o después de reiniciar, obtenemos un snapshot fresco
      if (simulation.tiempoActual === 0) {
        const snapshot = await obtenerSnapshot(simulation.simulationId);
        updateSimulationFromSnapshot(snapshot);
      }
      
      setPlaybackStatus('running');
    } catch (error) {
      console.error("❌ Error al iniciar la simulación:", error);
      setError("Error al iniciar la simulación");
    } finally {
      setLoading(false);
    }
  },

  pauseSimulation: () => {
    get().setPlaybackStatus('paused');
  },

  stopSimulation: async () => {
    const {
      simulation,
      setPlaybackStatus,
      setLoading,
      setError,
      updateSimulationFromSnapshot,
    } = get();

    if (!simulation.simulationId) {
      console.error("No hay un ID de simulación activo");
      return;
    }

    setPlaybackStatus('idle');
    setLoading(true);
    setError(null);

    try {
      await resetSimulacion(simulation.simulationId);
      const snapshot = await obtenerSnapshot(simulation.simulationId);
      updateSimulationFromSnapshot(snapshot);
    } catch (error) {
      console.error("❌ Error al detener la simulación:", error);
      setError("Error al detener la simulación");
    } finally {
      setLoading(false);
    }
  },

  stepForward: async () => {
    const {
      simulation,
      setLoading,
      setError,
      updateSimulationFromSnapshot
    } = get();

    if (!simulation.simulationId || simulation.playbackStatus === 'running') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const snapshot = await avanzarUnMinuto(simulation.simulationId);
      updateSimulationFromSnapshot(snapshot);
    } catch (error) {
      console.error("❌ Error al avanzar un minuto:", error);
      setError("Error al avanzar un paso de simulación");
    } finally {
      setLoading(false);
    }
  },

  advanceMultipleSteps: async (steps) => {
    const {
      simulation,
      setLoading,
      setError,
      updateSimulationFromSnapshot
    } = get();

    if (!simulation.simulationId || simulation.playbackStatus === 'running') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const snapshot = await avanzarMultiplesMinutos(simulation.simulationId, steps);
      updateSimulationFromSnapshot(snapshot);
    } catch (error) {
      console.error(`❌ Error al avanzar ${steps} pasos:`, error);
      setError(`Error al avanzar ${steps} pasos de simulación`);
    } finally {
      setLoading(false);
    }
  },
addBreakdown: async (averia: Omit<AveriaDTO, 'turno'>) => {
  const { simulation, setLoading, setError } = get();
  
  if (!simulation.simulationId) {
    console.error("No hay una simulación activa");
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const minutos = simulation.tiempoActual;
    const minutosDelDia = minutos % 1440; // 1440 minutos = 24 horas
    const turno = 
      minutosDelDia < 480 ? 'T1' : // 480 minutos = 8 horas
      minutosDelDia < 960 ? 'T2' : // 960 minutos = 16 horas
      'T3';
    
    // Crear el objeto con el turno
    const averiaConTurno = {
      ...averia,
      turno
    };

    // Hacer la llamada al backend
    const response = await api.post(`/simulacion/${simulation.simulationId}/averia`, averiaConTurno);
    
    // Actualizar el estado
    set((state) => ({
      simulationData: {
        ...state.simulationData,
        averias: [...state.simulationData.averias, response.data]
      }
    }));
  } catch (error) {
    console.error("❌ Error al declarar avería:", error);
    setError("Error al declarar avería");
  } finally {
    setLoading(false);
  }
},
  // Ya definido arriba
  // setMode: (mode) => set(() => ({ mode })),
}));

// Hook personalizado para el polling de la simulación
export function useSimulationPolling() {
  const { 
    simulation,
    updateSimulationFromSnapshot,
    setPlaybackStatus,
    setError
  } = useAppStore();

  useEffect(() => {
    // Si no está en marcha o está pausado, no hacemos nada
    if (
      simulation.playbackStatus !== 'running' || 
      !simulation.simulationId
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const snapshot = await avanzarUnMinuto(simulation.simulationId!);
        updateSimulationFromSnapshot(snapshot);
      } catch (error) {
        console.error("❌ Falló el paso de simulación:", error);
        clearInterval(interval);
        setPlaybackStatus('idle');
        setError("Error durante la simulación automática");
      }
    }, 1000); // 1 segundo entre pasos

    return () => clearInterval(interval);
  }, [
    simulation.playbackStatus,
    simulation.simulationId,
    updateSimulationFromSnapshot,
    setPlaybackStatus,
    setError
  ]);
}
