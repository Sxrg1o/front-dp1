// types/store.ts
import { 
  PedidoDTO, 
  TruckDTO, 
  TanqueDTO, 
  BloqueoDTO,
  SimulacionSnapshotDTO,
  SimulationConfig
} from './types';

// Estados de reproducción de la simulación
export type PlaybackStatus = 'idle' | 'running' | 'paused';

// Estado de carga y errores
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Estado de la simulación
export interface SimulationState {
  simulationId: string | null;
  config: SimulationConfig | null;
  tiempoActual: number;
  playbackStatus: PlaybackStatus;
  loadingState: LoadingState;
}

// Estado de los datos de la simulación
export interface SimulationDataState {
  pedidos: PedidoDTO[];
  camiones: TruckDTO[];
  tanques: TanqueDTO[];
  bloqueos: BloqueoDTO[];
  activeBlockageIds: string[];
}

// Estado de configuración de la UI
export interface UIState {
  selectedEntityId: string | null;
  selectedEntityType: 'pedido' | 'camion' | 'tanque' | 'bloqueo' | null;
  selectedTab: string;
  isSidebarOpen: boolean;
}

// Tipo para los modos de la aplicación
export type AppMode = 'simulation' | 'operational';

// Estado global de la aplicación
export interface AppState {
  mode: AppMode;
  simulation: SimulationState;
  operational: SimulationState;  // Estado separado para modo operational
  simulationData: SimulationDataState;
  operationalData: SimulationDataState;  // Datos separados para modo operational
  ui: UIState;
}

// Acciones para la simulación
export interface SimulationActions {
  setSimulationId: (id: string | null) => void;
  setSimulationConfig: (config: SimulationConfig | null) => void;
  setTiempoActual: (tiempo: number) => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Acciones para los datos de la simulación
export interface DataActions {
  // Acciones para datos de simulación
  setSimulationPedidos: (updater: PedidoDTO[] | ((prevPedidos: PedidoDTO[]) => PedidoDTO[])) => void;
  setSimulationCamiones: (updater: TruckDTO[] | ((prevCamiones: TruckDTO[]) => TruckDTO[])) => void;
  setSimulationTanques: (tanques: TanqueDTO[]) => void;
  setSimulationBloqueos: (updater: BloqueoDTO[] | ((prev: BloqueoDTO[]) => BloqueoDTO[])) => void;
  setActiveBlockageIds: (updater: string[] | ((prev: string[]) => string[])) => void;
  updateSimulationFromSnapshot: (snapshot: SimulacionSnapshotDTO) => void;
  
  // Acciones para datos de operaciones
  setOperationalPedidos: (pedidos: PedidoDTO[]) => void;
  setOperationalCamiones: (camiones: TruckDTO[]) => void;
  setOperationalTanques: (tanques: TanqueDTO[]) => void;
  setOperationalBloqueos: (bloqueos: BloqueoDTO[]) => void;
  updateOperationalFromSnapshot: (snapshot: SimulacionSnapshotDTO) => void;
}

// Acciones para la UI
export interface UIActions {
  setSelectedEntity: (id: string | null, type: 'pedido' | 'camion' | 'tanque' | 'bloqueo' | null) => void;
  setSelectedTab: (tab: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setMode: (mode: AppMode) => void;
}

// Acciones de la API de la simulación
export interface APIActions {
  initializeSimulation: (simulationId: string) => Promise<void>;
  startSimulation: () => Promise<void>;
  pauseSimulation: () => void;
  stopSimulation: () => Promise<void>;
  stepForward: () => Promise<void>;
  advanceMultipleSteps: (steps: number) => Promise<void>;
}

// Todas las acciones combinadas
export interface AppActions extends SimulationActions, DataActions, UIActions, APIActions {}

// Store completo (estado + acciones)
export type AppStore = AppState & AppActions;
