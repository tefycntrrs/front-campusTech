// Llamadas al back de pedidos (PedidoController y UsuarioController). Requieren token.

import { apiGet, apiPost } from "./client";
import type { PedidoResponse } from "../dto/compras";

// GET /api/usuarios/me/pedidos: 204 si no tiene pedidos
export async function getMisPedidos(): Promise<PedidoResponse[]> {
  const pedidos = await apiGet<PedidoResponse[]>("/usuarios/me/pedidos");
  return pedidos ?? [];
}

// GET /api/pedidos/{id}: solo el dueño
export async function getPedido(id: number): Promise<PedidoResponse> {
  const pedido = await apiGet<PedidoResponse>(`/pedidos/${id}`);
  if (!pedido) throw new Error("El servidor no devolvió el pedido.");
  return pedido;
}

// POST /api/pedidos/{id}/cancelar: pasa a CANCELADO y devuelve el stock
export async function cancelarPedido(id: number): Promise<PedidoResponse> {
  const pedido = await apiPost<PedidoResponse>(`/pedidos/${id}/cancelar`);
  if (!pedido) throw new Error("El servidor no devolvió el pedido.");
  return pedido;
}

// POST /api/carritos/{carritoId}/checkout: usa el id del carrito, no el del usuario
export async function checkout(carritoId: number): Promise<PedidoResponse> {
  const pedido = await apiPost<PedidoResponse>(`/carritos/${carritoId}/checkout`);
  if (!pedido) throw new Error("El servidor no devolvió el pedido.");
  return pedido;
}
