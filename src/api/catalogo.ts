// Llamadas al back relacionadas con el catálogo (ProductoController y CategoriaController).

import { apiGet } from "./client";
import type { Categoria, Producto } from "../dto/catalogo";

// GET /api/productos → productos activos ordenados por nombre (204 si no hay)
export async function getProductos(): Promise<Producto[]> {
  const productos = await apiGet<Producto[]>("/productos");
  return productos ?? []; // si vino 204 (null), devolvemos una lista vacía
}

// GET /api/categorias → todas las categorías (204 si no hay)
export async function getCategorias(): Promise<Categoria[]> {
  const categorias = await apiGet<Categoria[]>("/categorias");
  return (categorias ?? []).filter((categoria) => categoria.activo);
}