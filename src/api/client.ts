// Cliente HTTP: una sola función para hacer GET a la API.
// Todas las llamadas al back pasan por acá, así el manejo de errores está en un solo lugar.

// "/api" → el proxy de Vite (vite.config.ts) lo reenvía a http://localhost:8081
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export async function apiGet<T>(path: string): Promise<T | null> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    // fetch solo falla así cuando no hay conexión
    throw new Error("No pudimos conectarnos con el servidor.");
  }

  // El back responde 204 (sin cuerpo) cuando una lista está vacía.
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    // El back siempre devuelve errores con la forma de ErrorResponse: { status, message, ... }
    let message = "El servidor no está disponible. Revisá que el back esté levantado.";
    try {
      const error = await response.json();
      if (error.message) message = error.message;
    } catch {
      // Sin cuerpo JSON (por ejemplo, el back está apagado): dejamos el mensaje genérico
    }
    throw new Error(message);
  }

  return response.json();
}