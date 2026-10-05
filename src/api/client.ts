// Cliente HTTP: todas las llamadas al back pasan por acá, así el token
// y el manejo de errores están en un solo lugar.

// "/api" → el proxy de Vite (vite.config.ts) lo reenvía a http://localhost:8081
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// Clave de localStorage donde se guarda el token de la sesión.
const TOKEN_KEY = "campustech_token";

// Evento que se dispara en window cuando el back rechaza el token (401).
// Quien maneje la sesión lo escucha para cerrarla:
//   window.addEventListener(EVENTO_SESION_VENCIDA, () => logout());
export const EVENTO_SESION_VENCIDA = "campustech:sesion-vencida";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Error de la API. Además del mensaje trae el status, para poder distinguir casos:
// 401 = no hay sesión o venció, 403 = hay sesión pero sin permiso, 404 = no existe, etc.
export class ApiError extends Error {
  status: number;
  // Detalle campo por campo: solo viene en los errores de validación (400)
  errores?: Record<string, string>;

  constructor(status: number, message: string, errores?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errores = errores;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  const headers: Record<string, string> = {};

  // Si hay token guardado, va en todas las requests
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch solo falla así cuando no hay conexión
    throw new Error("No pudimos conectarnos con el servidor.");
  }

  // El back responde 204 (sin cuerpo) cuando una lista está vacía o después de un DELETE.
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    // El back siempre devuelve errores con la forma de ErrorResponse: { status, message, errores?, ... }
    let message = "El servidor no está disponible. Revisá que el back esté levantado.";
    let errores: Record<string, string> | undefined;
    try {
      const error = await response.json();
      if (error.message) message = error.message;
      errores = error.errores;
    } catch {
      // Sin cuerpo JSON (por ejemplo, el back está apagado): dejamos el mensaje genérico
    }

    // 401 con token enviado = el token venció o no sirve más: avisamos a la app para que cierre la sesión.
    // Sin token no avisamos: es, por ejemplo, un login con la contraseña incorrecta.
    // El 403 no cierra la sesión: el usuario está logueado, solo que no tiene permiso.
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));
    }

    throw new ApiError(response.status, message, errores);
  }

  return response.json();
}

export function apiGet<T>(path: string): Promise<T | null> {
  return request<T>("GET", path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T | null> {
  return request<T>("POST", path, body);
}

export function apiPut<T>(path: string, body?: unknown): Promise<T | null> {
  return request<T>("PUT", path, body);
}

export function apiDelete<T>(path: string): Promise<T | null> {
  return request<T>("DELETE", path);
}
