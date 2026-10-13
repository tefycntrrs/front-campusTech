// Confirmación después del checkout. Ruta: /compra-exitosa

import { Link, useLocation } from "react-router-dom";
import Icon from "../components/Icon";

export default function CompraExitosa() {
  // El número del pedido llega por state desde Checkout
  const numero = (useLocation().state as { numero?: string } | null)?.numero;

  return (
    <main className="success-page">
      <div className="success-check">
        <Icon name="check" size={42} />
      </div>
      <h1>¡Compra exitosa!</h1>
      <p>Tu pedido fue confirmado.</p>
      {numero && (
        <div className="success-order">
          <Icon name="package" size={26} />
          <div>
            <small>Número de pedido</small>
            <strong>{numero}</strong>
          </div>
        </div>
      )}
      <div className="success-actions">
        <Link className="btn btn-primary no-underline" to="/cuenta/compras">
          Ver mis compras
        </Link>
        <Link className="btn btn-secondary no-underline" to="/productos">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}
