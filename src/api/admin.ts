// Llamadas al back para el ABM de categorías y marcas (T16).
// Los GET son públicos, pero POST y PUT exigen rol ADMIN: sin ese rol el back responde 403.

import { apiGet, apiPost, apiPut } from "./client";
import type { Categoria, CategoriaRequest, Marca, MarcaRequest } from "../dto/catalogo";

// GET /api/categorias → todas, INCLUIDAS las inactivas (204 si no hay).
// A diferencia de getCategorias() de catalogo.ts no filtramos: el admin tiene que ver
// las inactivas para poder volver a activarlas.
export async function getTodasLasCategorias(): Promise<Categoria[]> {
  const categorias = await apiGet<Categoria[]>("/categorias");
  return categorias ?? [];
}

// POST /api/categorias → 201 con la categoría creada. 409 si el nombre ya existe.
export async function crearCategoria(datos: CategoriaRequest): Promise<Categoria> {
  const categoria = await apiPost<Categoria>("/categorias", datos);
  if (!categoria) throw new Error("El servidor no devolvió la categoría creada.");
  return categoria;
}

// PUT /api/categorias/{id} → la categoría actualizada.
// No es parcial: hay que mandar nombre, descripción y activo aunque solo cambie uno.
export async function editarCategoria(id: number, datos: CategoriaRequest): Promise<Categoria> {
  const categoria = await apiPut<Categoria>(`/categorias/${id}`, datos);
  if (!categoria) throw new Error("El servidor no devolvió la categoría actualizada.");
  return categoria;
}

// GET /api/marcas → todas, incluidas las inactivas (204 si no hay).
export async function getTodasLasMarcas(): Promise<Marca[]> {
  const marcas = await apiGet<Marca[]>("/marcas");
  return marcas ?? [];
}

// POST /api/marcas → 201 con la marca creada. 409 si el nombre ya existe.
export async function crearMarca(datos: MarcaRequest): Promise<Marca> {
  const marca = await apiPost<Marca>("/marcas", datos);
  if (!marca) throw new Error("El servidor no devolvió la marca creada.");
  return marca;
}

// PUT /api/marcas/{id} → la marca actualizada. Igual que categorías: se manda todo.
export async function editarMarca(id: number, datos: MarcaRequest): Promise<Marca> {
  const marca = await apiPut<Marca>(`/marcas/${id}`, datos);
  if (!marca) throw new Error("El servidor no devolvió la marca actualizada.");
  return marca;
}
