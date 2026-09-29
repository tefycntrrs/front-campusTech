// Tarjeta de un producto. Recibe el producto por props y lo dibuja.
// Es la misma tarjeta para cualquier producto: lo que cambia son los datos.

import Icon from "./Icon";
import { formatPrice, getImagenPrincipal } from "../utils/format";
import type { Producto } from "../dto/catalogo";
type ProductCardProps = {
  producto: Producto;
};

export default function ProductCard({ producto }: ProductCardProps) {
  const imagen = getImagenPrincipal(producto);
  const sinStock = producto.stock === 0;
  const pocoStock = producto.stock > 0 && producto.stock <= 4;

  let textoStock = "Stock disponible";
  if (sinStock) textoStock = "Sin stock";
  else if (pocoStock) textoStock = "Últimas unidades";

  return (
    <article className="product-card">
      <div className="product-image">
        {imagen ? (
          <img alt={producto.nombre} src={imagen} loading="lazy" />
        ) : (
          // Si el producto no tiene imágenes cargadas, mostramos un ícono en su lugar
          <div className="grid h-full place-items-center text-muted">
            <Icon name="package" size={48} />
          </div>
        )}
      </div>
      <div className="product-info">
        <small>{producto.marcaNombre ?? "Sin marca"}</small>
        <h3>{producto.nombre}</h3>
        <strong>{formatPrice(producto.precio)}</strong>
        <span className={sinStock || pocoStock ? "stock low" : "stock"}>{textoStock}</span>
      </div>
    </article>
  );
}