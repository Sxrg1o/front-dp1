import api from '../lib/api-client'; 

/**
 * Sube un archivo al backend y devuelve un ID de archivo temporal.
 * @param archivo El objeto File a subir.
 * @returns Una promesa que se resuelve con el fileId (string).
 */
export async function guardarArchivoTemporal(archivo: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('archivo', archivo);

    // Llama al endpoint POST /uploads que esperamos esté en el backend
    // Si tu API está versionada o tiene un prefijo, ajústalo aquí (ej. /api/v1/uploads)
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Asumimos que el backend devuelve el fileId directamente en response.data
    // Si la estructura es diferente (ej. { data: { fileId: '...' } }), ajusta el acceso aquí
    if (typeof response.data === 'string') {
      return response.data;
    } else if (response.data && typeof response.data.fileId === 'string') {
      return response.data.fileId; 
    } else {
      console.error("Respuesta inesperada del servidor al subir archivo:", response.data);
      throw new Error("Formato de respuesta inesperado del servidor.");
    }

  } catch (error) {
    console.error("Error en el servicio al subir archivo:", error);
    // Lanza el error para que el componente que llama (el formulario) pueda manejarlo
    // Podrías querer personalizar el mensaje de error basado en el tipo de error si es posible
    if (error instanceof Error && error.message.includes('Network Error')) {
        throw new Error("Error de red. No se pudo conectar al servidor para subir el archivo.");
    }
    throw new Error("No se pudo subir el archivo. Inténtalo de nuevo más tarde.");
  }
}
