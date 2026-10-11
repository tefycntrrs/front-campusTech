// Llamadas al back relacionadas con el catálogo (Producto, Categoria y Marca).
// Estas funciones solo piden datos: no guardan estado ni deciden qué se dibuja en pantalla.
// Las páginas (Productos, ProductoDetalle, Home) son las que las usan.

import { apiGet } from "./client";
import type { Categoria, Marca, Producto } from "../dto/catalogo";

// GET /api/productos → productos activos ordenados por nombre (204 si no hay)
export async function getProductos(): Promise<Producto[]> {
  const productos = await apiGet<Producto[]>("/productos");
  return productos ?? []; // si vino 204 (null), devolvemos una lista vacía
}

// GET /api/productos/{id} → un producto para la página de detalle.
// 404 si no existe o está dado de baja (el back lo trata como inexistente).
export async function getProducto(id: number): Promise<Producto> {
  const producto = await apiGet<Producto>(`/productos/${id}`);
  if (!producto) throw new Error("El servidor no devolvió el producto.");
  return producto;
}

// GET /api/productos/buscar?q=texto → coincidencia parcial por nombre, sin importar mayúsculas.
// encodeURIComponent evita que espacios o acentos rompan la URL.
// 204 si no hay coincidencias → lista vacía.
export async function buscarProductos(q: string): Promise<Producto[]> {
  const productos = await apiGet<Producto[]>(
    `/productos/buscar?q=${encodeURIComponent(q)}`,
  );
  return productos ?? [];
}

// GET /api/productos/total → cantidad de productos activos (opcional, para el título del listado).
export async function getTotalProductos(): Promise<number> {
  const total = await apiGet<number>("/productos/total");
  return total ?? 0;
}

// GET /api/categorias → todas las categorías (204 si no hay).
// Filtramos las inactivas: no tienen que aparecer en el Home ni en el filtro.
export async function getCategorias(): Promise<Categoria[]> {
  const categorias = await apiGet<Categoria[]>("/categorias");
  return (categorias ?? []).filter((categoria) => categoria.activo);
}

// GET /api/categorias/{id}/productos → activos de esa categoría (204 si no hay).
// Lo usa el listado cuando la URL trae ?categoria=...
export async function getProductosPorCategoria(id: number): Promise<Producto[]> {
  const productos = await apiGet<Producto[]>(`/categorias/${id}/productos`);
  return productos ?? [];
}

// GET /api/marcas → opciones del filtro de marca del listado.
// Igual que categorías: solo mostramos las activas.
export async function getMarcas(): Promise<Marca[]> {
  const marcas = await apiGet<Marca[]>("/marcas");
  return (marcas ?? []).filter((marca) => marca.activo);
}
