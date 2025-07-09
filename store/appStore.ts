// store/appStore.ts
import { create } from 'zustand';
import { 
  AppState, 
  AppActions,
  AppStore,
  PlaybackStatus,
} from '@/types/store';
import { SimulacionSnapshotDTO, SimulationConfig } from '@/types/types'; // Corregida importación de SimulationConfig
import { useEffect } from 'react'; // Añadida importación de useEffect
import {
  avanzarUnMinuto,
  resetSimulacion,
  avanzarMultiplesMinutos,
  obtenerSnapshot,
  ejecutarSimulacion,
  pausarSimulacion,
  reanudarSimulacion
} from '@/services/simulacion-service';

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
    activeBlockageIds: [] 
  },
  operationalData: {
    pedidos: [],
    camiones: [],
    tanques: [],
    bloqueos: [],
    activeBlockageIds: []
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
  setSimulationPedidos: (updater) => set((state) => {
    const prevPedidos = state.simulationData.pedidos;
    const nuevosPedidos = typeof updater === 'function' ? updater(prevPedidos) : updater;
    return {
      simulationData: { ...state.simulationData, pedidos: nuevosPedidos }
    };
  }),

  setSimulationCamiones: (updater) => set((state) => {
    const prevCamiones = state.simulationData.camiones;
    
    // Si el updater es una función, la llamamos con el estado anterior.
    // Si no, usamos el valor directamente (que sería el array).
    const nuevosCamiones = typeof updater === 'function' ? updater(prevCamiones) : updater;
    
    return {
      simulationData: { ...state.simulationData, camiones: nuevosCamiones }
    };
  }),

  setSimulationTanques: (tanques) => set((state) => ({
    simulationData: { ...state.simulationData, tanques }
  })),

  setSimulationBloqueos: (updater) => set((state) => {
    const prevBloqueos = state.simulationData.bloqueos;
    const nuevosBloqueos = typeof updater === 'function' ? updater(prevBloqueos) : updater;
    return {
      simulationData: { ...state.simulationData, bloqueos: nuevosBloqueos }
    };
  }),

  setActiveBlockageIds: (updater) => set((state) => {
    const prevIds = state.simulationData.activeBlockageIds;
    const nuevosIds = typeof updater === 'function' ? updater(prevIds) : updater;
    return {
      simulationData: { ...state.simulationData, activeBlockageIds: nuevosIds }
    };
  }),
  
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
        bloqueos: snapshot.bloqueos || []
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
        bloqueos: snapshot.bloqueos || []
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
      // Si es la primera vez o después de reiniciar, llamamos al endpoint /run
      if (simulation.playbackStatus === 'idle') {
        // Primero obtenemos un snapshot fresco
        const snapshot = await obtenerSnapshot(simulation.simulationId);
        updateSimulationFromSnapshot(snapshot);
        
        // Luego iniciamos la ejecución continua en el backend
        await ejecutarSimulacion(simulation.simulationId);
      } else if (simulation.playbackStatus === 'paused') {
        // Si está pausada, llamamos al endpoint para reanudar
        await reanudarSimulacion(simulation.simulationId);
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
      await pausarSimulacion(simulation.simulationId);
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
      // Reiniciamos la simulación en el backend
      await resetSimulacion(simulation.simulationId);
      
      // Obtenemos el estado inicial después del reset
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

  // Ya definido arriba
  // setMode: (mode) => set(() => ({ mode })),
}));
