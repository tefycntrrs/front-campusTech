// Detalle de un producto. Ruta: /productos/:id
// :id lo pone React Router (ej: /productos/12 → id = "12").

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import StateMessage from "../components/StateMessage";
import { getCategorias, getProducto } from "../api/catalogo";
import { ApiError } from "../api/client";
import { formatPrice } from "../utils/format";
import type { Categoria, Producto } from "../dto/catalogo";

// El back manda las imágenes sueltas; las ordenamos por el campo "orden" para la galería.
function imagenesOrdenadas(producto: Producto) {
  return [...producto.imagenes].sort((a, b) => a.orden - b.orden);
}

export default function ProductoDetalle() {
  const { id } = useParams();
  // Si el id no es un número (/productos/abc), ni llamamos al back: es "no encontrado".
  const productoId = id && /^\d+$/.test(id) ? Number(id) : null;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagenActiva, setImagenActiva] = useState<string | null>(null); // foto grande de la galería
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia el id de la URL (otra tarjeta, otro link) pedimos el producto de nuevo.
  useEffect(() => {
    if (productoId == null) {
      setNoEncontrado(true);
      setCargando(false);
      return;
    }

    let cancelado = false; // si el usuario se va a otro producto, ignoramos esta respuesta
    setCargando(true);
    setNoEncontrado(false);
    setError(null);
    setProducto(null);
    setCantidad(1);

    // El producto solo trae categoriaIds. Pedimos /categorias para mostrar los nombres.
    Promise.all([getProducto(productoId), getCategorias()])
      .then(([productoRecibido, categoriasRecibidas]) => {
        if (cancelado) return;
        setProducto(productoRecibido);
        setCategorias(categoriasRecibidas);
        const galeria = imagenesOrdenadas(productoRecibido);
        // Arrancamos con la imagen marcada como principal; si ninguna lo está, la primera.
        const principal = galeria.find((imagen) => imagen.principal) ?? galeria[0];
        setImagenActiva(principal?.url ?? null);
      })
      .catch((err: Error) => {
        if (cancelado) return;
        // 404 = no existe o está inactivo. El resto (red caída, 500) es un error común.
        if (err instanceof ApiError && err.status === 404) {
          setNoEncontrado(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [productoId]);

  if (cargando) {
    return (
      <main className="page-shell">
        <StateMessage title="Cargando producto…" />
      </main>
    );
  }

  if (noEncontrado) {
    return (
      <main className="empty-state">
        <span>
          <Icon name="package" size={36} />
        </span>
        <h1>No encontramos este producto</h1>
        <p>Puede que lo hayan dado de baja o que el enlace ya no exista.</p>
        <Link className="btn btn-primary" to="/productos">
          Volver al listado
        </Link>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="page-shell">
        <StateMessage
          title="No pudimos cargar el producto"
          text={error ?? "Intentá de nuevo en un momento."}
        />
      </main>
    );
  }

  const galeria = imagenesOrdenadas(producto);
  const stock = producto.stock;
  const sinStock = stock === 0;
  // categoriaIds → nombres, cruzando con la lista de GET /api/categorias
  const nombresCategorias = producto.categoriaIds
    .map((categoriaId) => categorias.find((categoria) => categoria.categoriaId === categoriaId)?.nombre)
    .filter((nombre): nombre is string => Boolean(nombre));

  // El selector no puede bajar de 1 ni pasar el stock.
  function bajarCantidad() {
    setCantidad((actual) => Math.max(1, actual - 1));
  }

  function subirCantidad() {
    setCantidad((actual) => Math.min(stock, actual + 1));
  }

  return (
    <main className="page-shell">
      <nav className="breadcrumbs">
        <Link to="/">Inicio</Link>
        {" / "}
        <Link to="/productos">Productos</Link>
        {" / "}
        {producto.nombre}
      </nav>

      <section className="detail-card">
        {/* Con una sola foto no hace falta la columna de miniaturas (rompe el layout del prototipo). */}
        <div className={galeria.length > 1 ? "gallery" : undefined}>
          {galeria.length > 1 && (
            <div className="thumbnails">
              {galeria.map((imagen) => (
                <button
                  key={imagen.id}
                  type="button"
                  className={imagenActiva === imagen.url ? "selected" : undefined}
                  onClick={() => setImagenActiva(imagen.url)}
                >
                  <img alt="" src={imagen.url} />
                </button>
              ))}
            </div>
          )}
          <div className="main-image">
            {imagenActiva ? (
              <img alt={producto.nombre} src={imagenActiva} />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                <Icon name="package" size={64} />
              </div>
            )}
          </div>
        </div>

        <div className="buy-box">
          <p className="condition">{producto.marcaNombre ?? "Sin marca"}</p>
          <div className="title-row">
            <h1>{producto.nombre}</h1>
          </div>
          <p className="detail-price">{formatPrice(producto.precio)}</p>

          <div className="quantity">
            <span>Cantidad</span>
            <div>
              <button type="button" onClick={bajarCantidad} disabled={sinStock || cantidad <= 1}>
                −
              </button>
              <strong>{sinStock ? 0 : cantidad}</strong>
              <button
                type="button"
                onClick={subirCantidad}
                disabled={sinStock || cantidad >= stock}
              >
                +
              </button>
            </div>
            <small>
              {sinStock ? "Sin stock" : `${stock} disponibles`}
            </small>
          </div>

          {/* T9: conectar estos botones al carrito y al LoginModal si no hay sesión.
              T7 solo pide mostrarlos y deshabilitarlos cuando no hay stock. */}
          <button className="btn btn-primary full" type="button" disabled={sinStock}>
            Agregar al carrito
          </button>
          <button className="btn btn-secondary full" type="button" disabled={sinStock}>
            Comprar ahora
          </button>
        </div>
      </section>

      <section className="detail-content">
        <div>
          <h2>Descripción</h2>
          <p>{producto.descripcion || "Este producto todavía no tiene descripción."}</p>
        </div>
        <aside>
          <dl>
            <div>
              <dt>SKU</dt>
              <dd>{producto.sku ?? "—"}</dd>
            </div>
            <div>
              <dt>Marca</dt>
              <dd>{producto.marcaNombre ?? "—"}</dd>
            </div>
            <div>
              <dt>Categorías</dt>
              <dd>{nombresCategorias.length > 0 ? nombresCategorias.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>{stock}</dd>
            </div>
          </dl>
          <div className="seller">
            <span>Vendido por</span>
            <h3>{producto.vendedorUsername}</h3>
          </div>
        </aside>
      </section>
    </main>
  );
}
