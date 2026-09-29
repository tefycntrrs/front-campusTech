// Tipos del catálogo. Son el "espejo" en TypeScript de los DTOs del back
// (ProductoResponse, ImagenProductoResponse y CategoriaResponse).
// Si un DTO cambia en Java, hay que actualizar el tipo acá.

export type ImagenProducto = {
  id: number;
  url: string;
  orden: number;
  principal: boolean;
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number; // BigDecimal en Java llega como number en JSON
  stock: number;
  sku: string | null;
  activo: boolean;
  categoriaIds: number[];
  marcaId: number | null;
  marcaNombre: string | null;
  vendedorId: number;
  vendedorUsername: string;
  imagenes: ImagenProducto[];
  createdAt: string; // LocalDateTime llega como texto ISO: "2026-09-20T18:49:00"
  updatedAt: string;
};

export type Categoria = {
  categoriaId: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};