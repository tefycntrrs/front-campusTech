// Llamadas al back del carrito (CarritoController). Requieren token.

import { apiDelete, apiGet, apiPost } from "./client";
import type { AgregarItemCarritoRequest, CarritoResponse } from "../dto/compras";

// GET /api/carritos/usuarios/{usuarioId}: 404 si no tiene carrito activo
export async function getCarrito(usuarioId: number): Promise<CarritoResponse> {
  const carrito = await apiGet<CarritoResponse>(`/carritos/usuarios/${usuarioId}`);
  if (!carrito) throw new Error("El servidor no devolvió el carrito.");
  return carrito;
}

// POST /api/carritos/usuarios/{usuarioId}/items
export async function agregarItem(usuarioId: number, datos: AgregarItemCarritoRequest): Promise<CarritoResponse> {
  const carrito = await apiPost<CarritoResponse>(`/carritos/usuarios/${usuarioId}/items`, datos);
  if (!carrito) throw new Error("El servidor no devolvió el carrito actualizado.");
  return carrito;
}

// DELETE /api/carritos/usuarios/{usuarioId}/items/{itemId}
export async function eliminarItem(usuarioId: number, itemId: number): Promise<CarritoResponse> {
  const carrito = await apiDelete<CarritoResponse>(`/carritos/usuarios/${usuarioId}/items/${itemId}`);
  if (!carrito) throw new Error("El servidor no devolvió el carrito actualizado.");
  return carrito;
}

// DELETE /api/carritos/usuarios/{usuarioId}/items
export async function vaciarCarrito(usuarioId: number): Promise<CarritoResponse> {
  const carrito = await apiDelete<CarritoResponse>(`/carritos/usuarios/${usuarioId}/items`);
  if (!carrito) throw new Error("El servidor no devolvió el carrito actualizado.");
  return carrito;
}
