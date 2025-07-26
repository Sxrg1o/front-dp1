// store/appStore.ts
import { create } from 'zustand';
import { 
  AppState, 
  AppStore
} from '@/types/store';
import { AveriaDTO } from '@/types/types'; 

import {
  avanzarUnMinuto,
  avanzarMultiplesMinutos,
  obtenerSnapshot,
  addAveriaSimulacion,
  ejecutarSimulacion,
  pausarSimulacion,
  reanudarSimulacion,
  detenerSimulacion
} from '@/services/simulacion-service';

import api from '../lib/api-client';

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
    averias: [],
    activeBlockageIds: [] 
  },
  operationalData: {
    pedidos: [],
    camiones: [],
    tanques: [],
    bloqueos: [],
    averias: [],
    activeBlockageIds: []
  },
  ui: {
    selectedEntityId: null,
    selectedEntityType: null,
    selectedTab: 'leyenda',
    isSidebarOpen: true,
    modal: {
      isOpen: false,
      type: null,
      message: ''
    }
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

  setOperationalConfig: (config) => set((state) => ({
    operational: { ...state.operational, config }
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
          pedidos: t.pedidos || [],
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
        camiones: (snapshot.camiones || []).map((c: any) => ({
          ...c,
          status: c.status ?? c.estado ?? ""
        })),
        tanques: tanquesDTO,
        bloqueos: snapshot.bloqueos || [],
        averias: snapshot.averias || []
      }
    }));

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
          pedidos: t.pedidos || [],
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
        camiones: (snapshot.camiones || []).map((c: any) => ({
          ...c,
          status: c.status ?? c.estado ?? ""
        })),
        tanques: tanquesDTO,
        bloqueos: snapshot.bloqueos || [],
        averias: snapshot.averias || []
      }
    }));


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
      updateSimulationFromSnapshot,
      pauseSimulation
    } = get();
    
    // Si está ejecutándose, entonces pausar (toggle)
    if (simulation.playbackStatus === 'running') {
      pauseSimulation();
      return;
    }
    
    if (!simulation.simulationId) {
      console.error("No hay un ID de simulación activo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Si es la primera vez o después de reiniciar, llamamos al endpoint /run
      if (simulation.playbackStatus === 'idle') {
        // Primero obtenemos un snapshot fresco
        const snapshot = await obtenerSnapshot(simulation.simulationId);
        updateSimulationFromSnapshot(snapshot);
        
        // Luego iniciamos la ejecución continua en el backend
        await ejecutarSimulacion(simulation.simulationId);
      } else if (simulation.playbackStatus === 'paused') {
        // Si está pausada, llamamos al endpoint para reanudar
        await reanudarSimulacion();
      }
      
      setPlaybackStatus('running');
    } catch (error) {
      console.error("❌ Error al iniciar la simulación:", error);
      setError("Error al iniciar la simulación");
    } finally {
      setLoading(false);
    }
  },

  pauseSimulation: async () => {
    const { simulation, setPlaybackStatus, setError } = get();
    
    if (!simulation.simulationId || simulation.playbackStatus !== 'running') {
      return;
    }
    
    try {
      await pausarSimulacion();
      setPlaybackStatus('paused');
    } catch (error) {
      console.error("❌ Error al pausar la simulación:", error);
      setError("Error al pausar la simulación");
    }
  },

  stopSimulation: async () => {
    const {
      simulation,
      setPlaybackStatus,
      setLoading,
      setError,
    } = get();

    if (!simulation.simulationId) {
      console.error("No hay un ID de simulación activo");
      return;
    }

    setPlaybackStatus('idle');
    setLoading(true);
    setError(null);

    try {
      // Reiniciamos la simulación en el backend
      await detenerSimulacion(simulation.simulationId);
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
  
  openEndModal: (type, message, reporte = undefined) => set((state) => ({
    ui: { ...state.ui, modal: { isOpen: true, type, message, reporte } }
  })),

  closeEndModal: () => set((state) => ({
    ui: { ...state.ui, modal: { ...state.ui.modal, isOpen: false } }
  })),
  
  addBreakdown: async (averia: Omit<AveriaDTO, 'turno'>) => {
    const { mode, simulation, operational, setLoading, setError } = get();
    
    // Verificar si hay una simulación o operación activa según el modo
    const currentState = mode === 'simulation' ? simulation : operational;
    
    if (!currentState.simulationId && mode === 'simulation') {
      console.error("No hay una simulación activa");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Calcular el turno basado en el tiempo actual
      const date = new Date(currentState.tiempoActual);
      const minutos = date.getHours() * 60 + date.getMinutes();
      const minutosDelDia = minutos % 1440;
      const turno =
        minutosDelDia < 480 ? 'T1' :
        minutosDelDia < 960 ? 'T2' :
        'T3';
      
      // Crear el objeto con el turno
      const averiaConTurno = {
        ...averia,
        turno
      };

      // Diferenciar entre modo simulación y operaciones
      if (mode === 'simulation') {
        // En modo simulación, usar el endpoint específico de simulación
        const response = await api.post(`/simulacion/${currentState.simulationId}/averia`, averiaConTurno);
        
        // Actualizar el estado de simulación
        set((state) => ({
          simulationData: {
            ...state.simulationData,
            averias: [...state.simulationData.averias, response.data]
          }
        }));
      } else {
        // En modo operaciones, usar el endpoint general de averías
        const response = await api.post(`/operaciones/averia`, averiaConTurno);
        
        // Actualizar el estado de operaciones
        set((state) => ({
          operationalData: {
            ...state.operationalData,
            averias: [...state.operationalData.averias, response.data]
          }
        }));
      }
      
    } catch (error) {
      console.error(`❌ Error al declarar avería en modo ${mode}:`, error);
      setError(`Error al declarar avería en modo ${mode}`);
    } finally {
      setLoading(false);
    }
  },
  // Ya definido arriba
  // setMode: (mode) => set(() => ({ mode })),
}));
