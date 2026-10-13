// Historial de pedidos. Ruta: /cuenta/compras

import { useEffect, useState } from "react";
import CuentaLayout from "../../components/CuentaLayout";
import StateMessage from "../../components/StateMessage";
import { cancelarPedido, getMisPedidos } from "../../api/pedidos";
import type { PedidoResponse } from "../../dto/compras";
import { formatDate, formatPrice } from "../../utils/format";

export default function Compras() {
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  useEffect(() => {
    getMisPedidos()
      .then(setPedidos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  async function cancelar(pedido: PedidoResponse) {
    if (!window.confirm(`¿Cancelar el pedido ${pedido.numero}?`)) return;

    setCancelandoId(pedido.id);
    setErrorCancelar(null);
    try {
      const actualizado = await cancelarPedido(pedido.id);
      setPedidos((actuales) => actuales.map((actual) => (actual.id === actualizado.id ? actualizado : actual)));
    } catch (err) {
      setErrorCancelar(err instanceof Error ? err.message : "No pudimos cancelar el pedido.");
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <CuentaLayout>
      <div className="page-heading">
        <h1>Mis compras</h1>
      </div>

      {cargando && <StateMessage title="Cargando tus compras…" />}
      {error && <StateMessage title="No pudimos cargar tus compras" text={error} />}
      {!cargando && !error && pedidos.length === 0 && (
        <StateMessage title="Todavía no hiciste compras" text="Cuando compres, tus pedidos aparecen acá." />
      )}
      {errorCancelar && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
          {errorCancelar}
        </p>
      )}

      {pedidos.map((pedido) => (
        <article className="order-card" key={pedido.id}>
          <div className="order-head">
            <span>
              <small>Fecha</small>
              <strong>{formatDate(pedido.createdAt)}</strong>
            </span>
            <span>
              <small>Pedido</small>
              <strong>{pedido.numero}</strong>
            </span>
            <i className={pedido.estado === "CANCELADO" ? "status empty" : "status"}>
              {pedido.estado === "CANCELADO" ? "Cancelado" : "Confirmado"}
            </i>
          </div>

          {pedido.detalles.map((detalle) => (
            <div className="flex justify-between gap-4 px-5 py-3 text-xs" key={detalle.id}>
              <span>
                {detalle.productoNombre} × {detalle.cantidad}
              </span>
              <b>{formatPrice(detalle.subtotal)}</b>
            </div>
          ))}

          <div className="order-foot">
            <span>
              Total <strong>{formatPrice(pedido.total)}</strong>
            </span>
            {pedido.estado === "CONFIRMADO" && (
              <button
                className="btn btn-secondary"
                type="button"
                disabled={cancelandoId === pedido.id}
                onClick={() => cancelar(pedido)}
              >
                Cancelar
              </button>
            )}
          </div>
        </article>
      ))}
    </CuentaLayout>
  );
}
