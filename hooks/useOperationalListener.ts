"use client"

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { Client } from '@stomp/stompjs';
import { SimulacionSnapshotDTO } from '@/types/types';
import { getSnapshotOperational } from '@/services/operation-service';

let stompClient: Client | null = null;

export function useOperationalListener() {
  const { updateOperationalFromSnapshot } = useAppStore();

  useEffect(() => {
    const initializeAndConnect = async () => {
      try {
        console.log("Obteniendo snapshot operacional inicial...");
        const initialSnapshot = await getSnapshotOperational();
        updateOperationalFromSnapshot(initialSnapshot as SimulacionSnapshotDTO);
        console.log("Snapshot operacional cargado.");
      } catch (error) {
        console.error("No se pudo cargar el snapshot operacional inicial.");
      }

      if (stompClient && stompClient.active) return;
      
      stompClient = new Client({
        brokerURL: 'ws://localhost:8080/ws-connect',
        reconnectDelay: 5000,
      });

      stompClient.onConnect = () => {
        console.log('✅ Conectado a WebSocket de Operaciones.');
        stompClient!.subscribe('/topic/operations', (message) => {
          try {
            const eventData = JSON.parse(message.body);
            console.log(`Evento recibido: ${eventData.type}`, eventData.payload);
            if (eventData.type === 'SNAPSHOT' && eventData.payload) {
              updateOperationalFromSnapshot(eventData.payload as SimulacionSnapshotDTO);
            }
          } catch (error) {
            console.error('Error al procesar mensaje de operaciones:', error);
          }
        });
      };

      stompClient.activate();
    };

    initializeAndConnect();

    return () => {
      if (stompClient && stompClient.active) {
        console.log('🛑 Desconectando de WebSocket de Operaciones.');
        stompClient.deactivate();
        stompClient = null;
      }
    };
  }, [updateOperationalFromSnapshot]);
}