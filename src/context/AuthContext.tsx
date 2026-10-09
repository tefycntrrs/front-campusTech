// Contexto de sesión Guarda quién está logueado y lo comparte con TODA la app.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as usuariosApi from "../api/usuarios";
import { EVENTO_SESION_VENCIDA, clearToken, getToken, setToken } from "../api/client";
import type { CreateUsuarioRequest, UsuarioResponse } from "../dto/usuario";

const EXPIRA_KEY = "campustech_token_expira";

// Todo lo que el contexto le ofrece al resto de la app.
type AuthContextValue = {
  usuario: UsuarioResponse | null; // null = nadie logueado
  estaLogueado: boolean;
  cargando: boolean; // true mientras revisamos si había una sesión guardada al abrir la app
  login: (email: string, password: string) => Promise<void>;
  registrar: (datos: CreateUsuarioRequest) => Promise<void>;
  logout: () => void;
};

// El contexto arranca en null: solo tiene valor adentro de <AuthProvider>.
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  // Si hay un token guardado arrancamos "cargando": todavía no sabemos si sirve.
  const [cargando, setCargando] = useState(() => getToken() !== null);

  function logout() {
    clearToken();
    localStorage.removeItem(EXPIRA_KEY);
    setUsuario(null);
  }

  async function login(email: string, password: string) {
    const respuesta = await usuariosApi.login({ email, password });
    setToken(respuesta.token);
    // expiraEnMs es una duración ("dura 24 h"). La pasamos a una fecha ("vence el jueves a las 20:45")
    // para que siga siendo correcta aunque se recargue la página más tarde.
    localStorage.setItem(EXPIRA_KEY, String(Date.now() + respuesta.expiraEnMs));
    setUsuario(respuesta.usuario);
  }

  async function registrar(datos: CreateUsuarioRequest) {
    await usuariosApi.registrar(datos);
    // El registro no devuelve token, así que iniciamos sesión con los mismos datos.
    await login(datos.email, datos.password);
  }

  // 1) Al abrir la app: si había un token guardado, le preguntamos al back de quién es.
  useEffect(() => {
    if (!getToken()) return; // no hay sesión guardada: no hay nada que recuperar

    const expira = Number(localStorage.getItem(EXPIRA_KEY));
    if (expira && expira <= Date.now()) {
      // Ya venció: ni lo intentamos
      logout();
      setCargando(false);
      return;
    }

    usuariosApi
      .getUsuarioActual()
      .then((usuarioGuardado) => setUsuario(usuarioGuardado))
      .catch(() => logout()) // token inválido, vencido o back apagado: empezamos sin sesión
      .finally(() => setCargando(false));
  }, []); // [] = solo una vez, cuando se monta el provider

  // 2) Si el back responde 401 a una request con token, client.ts dispara este evento: cerramos sesión.
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_VENCIDA, logout);
    // La función que devuelve un useEffect es la "limpieza": React la llama al desmontar.
    return () => window.removeEventListener(EVENTO_SESION_VENCIDA, logout);
  }, []);

  // 3) Mientras hay sesión, programamos el cierre para el momento exacto en que vence el token.
  useEffect(() => {
    if (!usuario) return;

    const expira = Number(localStorage.getItem(EXPIRA_KEY));
    if (!expira) return;

    const timer = setTimeout(logout, expira - Date.now());
    return () => clearTimeout(timer); // si cierra sesión antes, cancelamos el timer
  }, [usuario]); // se vuelve a ejecutar cada vez que cambia el usuario

  const value: AuthContextValue = {
    usuario,
    estaLogueado: usuario !== null,
    cargando,
    login,
    registrar,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para leer la sesión desde cualquier componente: const { usuario, logout } = useAuth();
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth tiene que usarse adentro de <AuthProvider> (ver App.tsx).");
  }
  return contexto;
}