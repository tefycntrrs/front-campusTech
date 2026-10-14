// Llamadas al back para vender: publicar, editar, pausar y dar de baja productos (Etapa 5).
// Todas necesitan token (lo agrega client.ts). El back usa el usuario del token como vendedor,
// y responde 403 si se intenta editar o borrar un producto de otra persona.

import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { CreateProductoRequest, Producto, UpdateProductoRequest } from "../dto/catalogo";

// POST /api/productos → 201 con el producto creado
export async function crearProducto(datos: CreateProductoRequest): Promise<Producto> {
  const producto = await apiPost<Producto>("/productos", datos);
  if (!producto) throw new Error("El servidor no devolvió el producto creado.");
  return producto;
}

// PUT /api/productos/{id} → actualización parcial, devuelve el producto actualizado
export async function actualizarProducto(id: number, cambios: UpdateProductoRequest): Promise<Producto> {
  const producto = await apiPut<Producto>(`/productos/${id}`, cambios);
  if (!producto) throw new Error("El servidor no devolvió el producto actualizado.");
  return producto;
}

// Pausar y activar son un PUT con solo el campo "activo"
export function cambiarActivoProducto(id: number, activo: boolean): Promise<Producto> {
  return actualizarProducto(id, { activo });
}

// DELETE /api/productos/{id} → 204. Es baja lógica: el back pone activo = false.
export async function darDeBajaProducto(id: number): Promise<void> {
  await apiDelete<void>(`/productos/${id}`);
}

// GET /api/usuarios/me/productos → todos los productos del usuario, incluidos los inactivos (204 si no tiene)
export async function getMisProductos(): Promise<Producto[]> {
  const productos = await apiGet<Producto[]>("/usuarios/me/productos");
  return productos ?? [];
}

// Un producto propio por id. No usamos GET /api/productos/{id} porque devuelve 404 si el producto
// está pausado, y un producto pausado se tiene que poder editar.
export async function getMiProducto(id: number): Promise<Producto | null> {
  const productos = await getMisProductos();
  return productos.find((producto) => producto.id === id) ?? null;
}
