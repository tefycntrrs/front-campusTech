// Confirmación de la compra. Ruta: /checkout

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import StateMessage from "../components/StateMessage";
import { checkout } from "../api/pedidos";
import { useCarrito } from "../context/CarritoContext";
import { formatPrice } from "../utils/format";

export default function Checkout() {
  const navigate = useNavigate();
  const { carrito, recargarCarrito } = useCarrito();
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recargarCarrito().finally(() => setCargando(false));
  }, [recargarCarrito]);

  async function confirmarCompra() {
    if (!carrito) return;
    setConfirmando(true);
    setError(null);
    try {
      const pedido = await checkout(carrito.id);
      navigate("/compra-exitosa", { state: { numero: pedido.numero } });
      // El carrito anterior queda FINALIZADO: se vuelve a pedir para que el contador quede en 0.
      recargarCarrito();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos confirmar la compra.");
      setConfirmando(false);
    }
  }

  if (cargando) {
    return (
      <main className="page-shell">
        <StateMessage title="Cargando…" />
      </main>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <main className="empty-state">
        <span>
          <Icon name="cart" size={36} />
        </span>
        <h1>Tu carrito está vacío</h1>
        <p>Agregá productos desde el catálogo para poder comprar.</p>
        <Link className="btn btn-primary" to="/productos">
          Ver productos
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <h1>Confirmar compra</h1>
      </div>

      <div className="checkout-layout">
        <section className="form-card checkout-form">
          <h2>Resumen del pedido</h2>
          {carrito.items.map((item) => (
            <div className="mb-3 flex justify-between gap-4 text-xs" key={item.id}>
              <span>
                {item.productoNombre} × {item.cantidad}
              </span>
              <strong>{formatPrice(item.subtotal)}</strong>
            </div>
          ))}
        </section>

        <aside className="summary">
          <h2>Total</h2>
          <div className="total">
            <span>Total a pagar</span>
            <strong>{formatPrice(carrito.total)}</strong>
          </div>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary full" type="button" disabled={confirmando} onClick={confirmarCompra}>
            Confirmar compra
          </button>
          <Link className="btn btn-secondary full mt-3 no-underline" to="/carrito">
            Volver al carrito
          </Link>
        </aside>
      </div>
    </main>
  );
}
