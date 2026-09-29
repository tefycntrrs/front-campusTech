import type { Producto } from "../dto/catalogo";
// 1299999 → "$ 1.299.999"
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

// Devuelve la URL de la imagen principal del producto, o la primera si ninguna está marcada.
// Si el producto no tiene imágenes devuelve null.
export function getImagenPrincipal(producto: Producto): string | null {
  const principal = producto.imagenes.find((imagen) => imagen.principal);
  return principal?.url ?? producto.imagenes[0]?.url ?? null;
}