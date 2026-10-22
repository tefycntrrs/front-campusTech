// Llamadas al back relacionadas con el catálogo (Producto, Categoria y Marca).
// Estas funciones solo piden datos: no guardan estado ni deciden qué se dibuja en pantalla.
// Las páginas (Productos, ProductoDetalle, Home) son las que las usan.
//
// MODO MOCK (TP de maquetado): con VITE_USE_MOCK=true en el .env, los datos salen de los
// archivos JSON de /public/data/ (mismo formato que los DTOs del back) en vez de la API.
// Las páginas no cambian: solo cambia de dónde llegan los datos.

import { apiGet } from "./client";
import type { Categoria, Marca, Producto } from "../dto/catalogo";

const USA_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Lee /data/<archivo>.json (carpeta public/ del proyecto)
async function leerMock<T>(archivo: string): Promise<T> {
  const response = await fetch(`/data/${archivo}.json`);
  if (!response.ok) throw new Error(`No pudimos leer los datos locales (${archivo}.json).`);
  return response.json();
}

// En el mock replicamos lo que hace el back: solo activos, ordenados A–Z por nombre
async function productosMock(): Promise<Producto[]> {
  const productos = await leerMock<Producto[]>("productos");
  return productos.filter((p) => p.activo).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// GET /api/productos → productos activos ordenados por nombre (204 si no hay)
export async function getProductos(): Promise<Producto[]> {
  if (USA_MOCK) return productosMock();
  const productos = await apiGet<Producto[]>("/productos");
  return productos ?? []; // si vino 204 (null), devolvemos una lista vacía
}

// GET /api/productos/{id} → un producto para la página de detalle.
// 404 si no existe o está dado de baja (el back lo trata como inexistente).
export async function getProducto(id: number): Promise<Producto> {
  if (USA_MOCK) {
    const encontrado = (await productosMock()).find((p) => p.id === id);
    if (!encontrado) throw new Error("No encontramos este producto.");
    return encontrado;
  }
  const producto = await apiGet<Producto>(`/productos/${id}`);
  if (!producto) throw new Error("El servidor no devolvió el producto.");
  return producto;
}

// GET /api/productos/buscar?q=texto → coincidencia parcial por nombre, sin importar mayúsculas.
// encodeURIComponent evita que espacios o acentos rompan la URL.
// 204 si no hay coincidencias → lista vacía.
export async function buscarProductos(q: string): Promise<Producto[]> {
  if (USA_MOCK) {
    const texto = q.trim().toLowerCase();
    return (await productosMock()).filter((p) => p.nombre.toLowerCase().includes(texto));
  }
  const productos = await apiGet<Producto[]>(
    `/productos/buscar?q=${encodeURIComponent(q)}`,
  );
  return productos ?? [];
}

// GET /api/productos/total → cantidad de productos activos (opcional, para el título del listado).
export async function getTotalProductos(): Promise<number> {
  if (USA_MOCK) return (await productosMock()).length;
  const total = await apiGet<number>("/productos/total");
  return total ?? 0;
}

// GET /api/categorias → todas las categorías (204 si no hay).
// Filtramos las inactivas: no tienen que aparecer en el Home ni en el filtro.
export async function getCategorias(): Promise<Categoria[]> {
  if (USA_MOCK) {
    return (await leerMock<Categoria[]>("categorias")).filter((categoria) => categoria.activo);
  }
  const categorias = await apiGet<Categoria[]>("/categorias");
  return (categorias ?? []).filter((categoria) => categoria.activo);
}

// GET /api/categorias/{id}/productos → activos de esa categoría (204 si no hay).
// Lo usa el listado cuando la URL trae ?categoria=...
export async function getProductosPorCategoria(id: number): Promise<Producto[]> {
  if (USA_MOCK) {
    return (await productosMock()).filter((p) => p.categoriaIds.includes(id));
  }
  const productos = await apiGet<Producto[]>(`/categorias/${id}/productos`);
  return productos ?? [];
}

// GET /api/marcas → opciones del filtro de marca del listado.
// Igual que categorías: solo mostramos las activas.
export async function getMarcas(): Promise<Marca[]> {
  if (USA_MOCK) {
    return (await leerMock<Marca[]>("marcas")).filter((marca) => marca.activo);
  }
  const marcas = await apiGet<Marca[]>("/marcas");
  return (marcas ?? []).filter((marca) => marca.activo);
}