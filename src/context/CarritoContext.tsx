// Contexto del carrito del usuario logueado: se carga al iniciar sesión y se vacía al cerrarla.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as carritoApi from "../api/carrito";
import { ApiError } from "../api/client";
import type { CarritoResponse } from "../dto/compras";
import { useAuth } from "./AuthContext";

type CarritoContextValue = {
  carrito: CarritoResponse | null;
  cantidad: number;
  recargarCarrito: () => Promise<void>;
};

const CarritoContext = createContext<CarritoContextValue | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);

  const usuarioId = usuario?.id;

  const recargarCarrito = useCallback(async () => {
    if (usuarioId === undefined) {
      setCarrito(null);
      return;
    }
    try {
      setCarrito(await carritoApi.getCarrito(usuarioId));
    } catch (error) {
      // 404: el usuario aún no tiene carrito activo
      if (!(error instanceof ApiError && error.status === 404)) {
        console.error("No pudimos cargar el carrito:", error);
      }
      setCarrito(null);
    }
  }, [usuarioId]);

  useEffect(() => {
    recargarCarrito();
  }, [recargarCarrito]);

  const value: CarritoContextValue = {
    carrito,
    cantidad: carrito ? carrito.items.reduce((total, item) => total + item.cantidad, 0) : 0,
    recargarCarrito,
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoContextValue {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error("useCarrito tiene que usarse adentro de <CarritoProvider>.");
  }
  return contexto;
}
