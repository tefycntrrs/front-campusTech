// Llamadas al back relacionadas con usuarios y sesión (UsuarioController).
// Estas funciones solo hablan con el back: no guardan el token ni recuerdan al usuario.
// De eso se encarga el AuthContext (context/AuthContext.tsx).

import { apiGet, apiPost } from "./client";
import type { CreateUsuarioRequest, LoginRequest, LoginResponse, UsuarioResponse } from "../dto/usuario";

// POST /api/usuarios/login → 200 con el token y el usuario, 401 si el email o la contraseña no coinciden
export async function login(datos: LoginRequest): Promise<LoginResponse> {
  const respuesta = await apiPost<LoginResponse>("/usuarios/login", datos);
  if (!respuesta) throw new Error("El servidor no devolvió los datos de la sesión.");
  return respuesta;
}

// POST /api/usuarios/registro → 201 con el usuario creado (no devuelve token),
export async function registrar(datos: CreateUsuarioRequest): Promise<UsuarioResponse> {
  const usuario = await apiPost<UsuarioResponse>("/usuarios/registro", datos);
  if (!usuario) throw new Error("El servidor no devolvió el usuario creado.");
  return usuario;
}

// GET /api/usuarios/me → el usuario dueño del token. Necesita token (lo agrega client.ts).
// Sirve para recuperar la sesión cuando se recarga la página.
export async function getUsuarioActual(): Promise<UsuarioResponse> {
  const usuario = await apiGet<UsuarioResponse>("/usuarios/me");
  if (!usuario) throw new Error("El servidor no devolvió el usuario.");
  return usuario;
}