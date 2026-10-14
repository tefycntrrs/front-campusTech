// Productos publicados por el usuario (T14). Ruta: /cuenta/publicaciones
// Muestra todos, incluidos los inactivos, y permite editar, pausar/activar y dar de baja.

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cambiarActivoProducto, darDeBajaProducto, getMisProductos } from "../../api/productos";
import CuentaLayout from "../../components/CuentaLayout";
import StateMessage from "../../components/StateMessage";
import type { Producto } from "../../dto/catalogo";
import { formatPrice, getImagenPrincipal } from "../../utils/format";

// Estado que se muestra en la tabla. El back solo tiene "activo" (true/false):
// "Sin stock" es un producto activo con stock 0, que nadie puede comprar.
function estadoDe(producto: Producto): { texto: string; clase: string } {
  if (!producto.activo) return { texto: "Inactivo", clase: "status paused" };
  if (producto.stock === 0) return { texto: "Sin stock", clase: "status empty" };
  return { texto: "Activo", clase: "status" };
}

export default function Publicaciones() {
  const navigate = useNavigate();
  const location = useLocation();
  // Mensaje que manda el formulario de vender después de publicar o editar
  const mensajeInicial = (location.state as { mensaje?: string } | null)?.mensaje ?? null;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(mensajeInicial);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    getMisProductos()
      .then((lista) => setProductos([...lista].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Reemplaza un producto de la lista por su versión actualizada
  function reemplazar(actualizado: Producto) {
    setProductos((actuales) => actuales.map((actual) => (actual.id === actualizado.id ? actualizado : actual)));
  }

  // Envuelve cada acción: marca la fila como "procesando" y muestra el error del back si falla
  async function ejecutar(producto: Producto, accion: () => Promise<void>, exito: string) {
    setProcesandoId(producto.id);
    setErrorAccion(null);
    setMensaje(null);
    try {
      await accion();
      setMensaje(exito);
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : "No pudimos completar la acción.");
    } finally {
      setProcesandoId(null);
    }
  }

  function pausarOActivar(producto: Producto) {
    const activar = !producto.activo;
    ejecutar(
      producto,
      async () => reemplazar(await cambiarActivoProducto(producto.id, activar)),
      activar ? `"${producto.nombre}" vuelve a estar en el catálogo.` : `"${producto.nombre}" quedó pausado.`,
    );
  }

  function darDeBaja(producto: Producto) {
    if (!window.confirm(`¿Dar de baja "${producto.nombre}"? Deja de aparecer en el catálogo.`)) return;
    ejecutar(
      producto,
      async () => {
        await darDeBajaProducto(producto.id);
        // El DELETE responde 204 sin cuerpo: actualizamos la fila a mano
        reemplazar({ ...producto, activo: false });
      },
      `"${producto.nombre}" se dio de baja.`,
    );
  }

  const texto = busqueda.trim().toLowerCase();
  const visibles = texto
    ? productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(texto) || (producto.sku ?? "").toLowerCase().includes(texto),
      )
    : productos;

  return (
    <CuentaLayout>
      <div className="page-heading">
        <h1>Mis publicaciones</h1>
        {!cargando && !error && productos.length > 0 && (
          <p>
            {productos.length} {productos.length === 1 ? "producto publicado" : "productos publicados"}
          </p>
        )}
      </div>

      {mensaje && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-xs text-success" role="status">
          {mensaje}
        </p>
      )}
      {errorAccion && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
          {errorAccion}
        </p>
      )}

      {cargando && <StateMessage title="Cargando tus publicaciones…" />}
      {error && <StateMessage title="No pudimos cargar tus publicaciones" text={error} />}

      {!cargando && !error && productos.length === 0 && (
        <div className="text-center">
          <StateMessage title="Todavía no publicaste productos" text="Lo que publiques va a aparecer acá." />
          <button className="btn btn-primary mt-5" type="button" onClick={() => navigate("/vender")}>
            Publicar mi primer producto
          </button>
        </div>
      )}

      {!cargando && !error && productos.length > 0 && (
        <>
          <div className="dashboard-toolbar">
            <input
              className="input max-w-xs"
              type="search"
              placeholder="Buscar por nombre o SKU"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={() => navigate("/vender")}>
              Publicar producto
            </button>
          </div>

          {visibles.length === 0 ? (
            <StateMessage title="No hay publicaciones que coincidan" text="Probá con otro nombre o SKU." />
          ) : (
            <div className="table w-full" /* w-full: Tailwind también tiene una clase "table" (display: table) que la achica */>
              <div className="table-row table-head">
                <span>Producto</span>
                <span>Estado</span>
                <span>Stock</span>
                <span>Precio</span>
                <span>Acciones</span>
              </div>

              {visibles.map((producto) => {
                const estado = estadoDe(producto);
                const imagen = getImagenPrincipal(producto);
                const ocupado = procesandoId === producto.id;
                return (
                  <div className="table-row" key={producto.id}>
                    <div className="table-product">
                      {imagen ? (
                        <img src={imagen} alt="" />
                      ) : (
                        <div className="h-12 w-[55px] shrink-0 rounded-md bg-blue-pale" />
                      )}
                      <span>
                        {/* Solo los activos tienen página pública: los inactivos dan 404 */}
                        {producto.activo ? (
                          <button
                            type="button"
                            className="text-left font-semibold hover:text-primary"
                            onClick={() => navigate(`/productos/${producto.id}`)}
                          >
                            {producto.nombre}
                          </button>
                        ) : (
                          producto.nombre
                        )}
                        {producto.sku && <small>SKU {producto.sku}</small>}
                      </span>
                    </div>
                    <span>
                      <i className={estado.clase}>{estado.texto}</i>
                    </span>
                    <span>{producto.stock}</span>
                    <span>{formatPrice(producto.precio)}</span>
                    <div className="row-actions flex-col items-start">
                      <button type="button" disabled={ocupado} onClick={() => navigate(`/vender/${producto.id}`)}>
                        Editar
                      </button>
                      <button type="button" disabled={ocupado} onClick={() => pausarOActivar(producto)}>
                        {producto.activo ? "Pausar" : "Activar"}
                      </button>
                      {producto.activo && (
                        <button
                          type="button"
                          className="!text-danger"
                          disabled={ocupado}
                          onClick={() => darDeBaja(producto)}
                        >
                          Dar de baja
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </CuentaLayout>
  );
}
