// Carrito de compras. Ruta: /carrito

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import StateMessage from "../components/StateMessage";
import { eliminarItem, vaciarCarrito } from "../api/carrito";
import { getProducto } from "../api/catalogo";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { formatPrice, getImagenPrincipal } from "../utils/format";

export default function Carrito() {
  const { usuario } = useAuth();
  const { carrito, recargarCarrito } = useCarrito();
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los items no traen imagen: se piden por producto. null = sin imagen.
  const [imagenes, setImagenes] = useState<Record<number, string | null>>({});

  useEffect(() => {
    recargarCarrito().finally(() => setCargando(false));
  }, [recargarCarrito]);

  useEffect(() => {
    const faltantes = (carrito?.items ?? []).map((item) => item.productoId).filter((id) => !(id in imagenes));
    if (faltantes.length === 0) return;

    let cancelado = false;
    Promise.all(
      faltantes.map((id) =>
        getProducto(id)
          .then(getImagenPrincipal)
          .catch(() => null)
          .then((url) => [id, url] as const),
      ),
    ).then((pares) => {
      if (!cancelado) setImagenes((actuales) => ({ ...actuales, ...Object.fromEntries(pares) }));
    });

    return () => {
      cancelado = true;
    };
  }, [carrito]);

  async function ejecutar(accion: () => Promise<unknown>) {
    setProcesando(true);
    setError(null);
    try {
      await accion();
      await recargarCarrito();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el carrito.");
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return (
      <main className="page-shell">
        <StateMessage title="Cargando carrito…" />
      </main>
    );
  }

  if (!usuario || !carrito || carrito.items.length === 0) {
    return (
      <main className="empty-state">
        <span>
          <Icon name="cart" size={36} />
        </span>
        <h1>Tu carrito está vacío</h1>
        <p>Agregá productos desde el catálogo para verlos acá.</p>
        <Link className="btn btn-primary" to="/productos">
          Ver productos
        </Link>
      </main>
    );
  }

  const sinStock = carrito.items.filter((item) => item.cantidad > item.stockDisponible);
  const unidades = carrito.items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <main className="page-shell">
      <div className="page-heading">
        <h1>Carrito</h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {sinStock.length > 0 && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
          Algunos productos tienen más cantidad que el stock disponible: {sinStock.map((item) => item.productoNombre).join(", ")}.
        </p>
      )}

      <div className="cart-layout">
        <div className="cart-items">
          {carrito.items.map((item) => (
            <div className="cart-item" key={item.id}>
              {imagenes[item.productoId] ? (
                <img alt={item.productoNombre} src={imagenes[item.productoId]!} />
              ) : (
                <div className="grid h-[105px] w-[130px] place-items-center rounded-lg bg-gray-50 text-muted">
                  <Icon name="package" size={32} />
                </div>
              )}
              <div className="cart-copy">
                <h3>
                  <Link to={`/productos/${item.productoId}`}>{item.productoNombre}</Link>
                </h3>
                <small>{formatPrice(item.precioReferencia)} c/u</small>
                {item.cantidad > item.stockDisponible && (
                  <small className="block text-danger">Stock disponible: {item.stockDisponible}</small>
                )}
                <button type="button" disabled={procesando} onClick={() => ejecutar(() => eliminarItem(usuario.id, item.id))}>
                  Eliminar
                </button>
              </div>
              <div className="cart-qty">
                <span>{item.cantidad}</span>
              </div>
              <strong>{formatPrice(item.subtotal)}</strong>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h2>Resumen</h2>
          <div>
            <span>Productos ({unidades})</span>
            <span>{formatPrice(carrito.total)}</span>
          </div>
          <hr />
          <div className="total">
            <span>Total</span>
            <strong>{formatPrice(carrito.total)}</strong>
          </div>
          <Link className="btn btn-primary full mt-4 no-underline" to="/checkout">
            Continuar compra
          </Link>
          <button
            className="btn btn-secondary full mt-3"
            type="button"
            disabled={procesando}
            onClick={() => ejecutar(() => vaciarCarrito(usuario.id))}
          >
            Vaciar carrito
          </button>
        </aside>
      </div>
    </main>
  );
}
