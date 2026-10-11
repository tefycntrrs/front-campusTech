// Tipos del catálogo. Son el "espejo" en TypeScript de los DTOs del back
// (ProductoResponse, ImagenProductoResponse, CategoriaResponse y MarcaResponse).
// Si un DTO cambia en Java, hay que actualizar el tipo acá.

export type ImagenProducto = {
  id: number;
  url: string;
  orden: number; // posición en la galería (0, 1, 2…). El back las manda desordenadas a veces
  principal: boolean; // la que se muestra en la tarjeta y como foto grande del detalle
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number; // BigDecimal en Java llega como number en JSON
  stock: number;
  sku: string | null;
  activo: boolean;
  categoriaIds: number[]; // el producto no trae los nombres, solo los ids (T7 los busca en /categorias)
  marcaId: number | null;
  marcaNombre: string | null;
  vendedorId: number;
  vendedorUsername: string;
  imagenes: ImagenProducto[];
  createdAt: string; // LocalDateTime llega como texto ISO: "2026-09-20T18:49:00"
  updatedAt: string;
};

export type Categoria = {
  categoriaId: number; // el back lo llama categoriaId, no id
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};

// Espejo de MarcaResponse. Lo usa el filtro de marca del listado.
export type Marca = {
  marcaId: number; // el back lo llama marcaId, no id
  nombre: string;
  activo: boolean;
};
