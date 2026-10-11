// Listado de productos con búsqueda y filtros. Ruta: /productos
//
// Dos tipos de filtro:
// 1) q y categoria viven en la URL (?q=notebook&categoria=1). Así se puede compartir
//    el link y el botón "atrás" del navegador vuelve al filtro anterior.
// 2) Precio, marca y orden se resuelven en el front sobre la lista que ya trajo el back.
//    El back no tiene endpoints para filtrar por precio o marca.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import StateMessage from "../components/StateMessage";
import {
  buscarProductos,
  getCategorias,
  getMarcas,
  getProductos,
  getProductosPorCategoria,
  getTotalProductos,
} from "../api/catalogo";
import type { Categoria, Marca, Producto } from "../dto/catalogo";

// Cómo se ordena la grilla. "relevancia" = el orden que mandó el back (A–Z por nombre).
type Orden = "relevancia" | "precio-asc" | "precio-desc";

// Convierte el texto de un input de precio a número. Vacío o inválido → null (sin filtro).
function leerNumero(valor: string): number | null {
  if (!valor.trim()) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export default function Productos() {
  // searchParams es la query actual. setSearchParams la cambia y React Router re-renderiza.
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q")?.trim() ?? "";
  const categoriaParam = searchParams.get("categoria");
  // Solo aceptamos un id numérico. Si alguien pone ?categoria=abc, lo ignoramos.
  const categoriaId =
    categoriaParam && /^\d+$/.test(categoriaParam) ? Number(categoriaParam) : null;

  // Datos que vienen del back
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [totalCatalogo, setTotalCatalogo] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros que se aplican en el front (no van a la URL)
  const [marcasElegidas, setMarcasElegidas] = useState<number[]>([]);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState<Orden>("relevancia");

  // Cada vez que cambian q o categoria en la URL, pedimos de nuevo al back.
  // Elegimos UN endpoint: buscar, por categoría, o el catálogo entero.
  useEffect(() => {
    let cancelado = false; // si el usuario cambia el filtro rápido, ignoramos la respuesta vieja
    setCargando(true);
    setError(null);

    const pedidoProductos = q
      ? buscarProductos(q)
      : categoriaId
        ? getProductosPorCategoria(categoriaId)
        : getProductos();

    // Categorías y marcas sirven para armar la barra de filtros.
    // El total es opcional: si /productos/total falla, el listado igual se muestra.
    Promise.all([
      pedidoProductos,
      getCategorias(),
      getMarcas(),
      getTotalProductos().catch(() => null),
    ])
      .then(([lista, categoriasRecibidas, marcasRecibidas, total]) => {
        if (cancelado) return;
        setProductos(lista);
        setCategorias(categoriasRecibidas);
        setMarcas(marcasRecibidas);
        setTotalCatalogo(total);
      })
      .catch((err: Error) => {
        if (cancelado) return;
        setError(err.message);
        setProductos([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [q, categoriaId]);

  // useMemo: solo recalcula cuando cambian estos valores. Filtra y ordena en el front.
  const visibles = useMemo(() => {
    const min = leerNumero(precioMin);
    const max = leerNumero(precioMax);

    const filtrados = productos.filter((producto) => {
      // Si hay búsqueda Y categoría, el back ya filtró por nombre; acá recortamos por categoría
      if (q && categoriaId && !producto.categoriaIds.includes(categoriaId)) return false;
      if (marcasElegidas.length > 0 && (producto.marcaId == null || !marcasElegidas.includes(producto.marcaId))) {
        return false;
      }
      if (min != null && producto.precio < min) return false;
      if (max != null && producto.precio > max) return false;
      return true;
    });

    if (orden === "precio-asc") {
      return [...filtrados].sort((a, b) => a.precio - b.precio);
    }
    if (orden === "precio-desc") {
      return [...filtrados].sort((a, b) => b.precio - a.precio);
    }
    return filtrados; // "Recomendados": dejamos el orden del back
  }, [productos, q, categoriaId, marcasElegidas, precioMin, precioMax, orden]);

  const categoriaActiva = categorias.find((categoria) => categoria.categoriaId === categoriaId);
  const hayFiltros =
    Boolean(q) ||
    categoriaId != null ||
    marcasElegidas.length > 0 ||
    Boolean(precioMin.trim() || precioMax.trim());

  // Cambia la URL sin borrar los otros params. Así, al elegir categoría no se pierde ?q=.
  function actualizarParams(mutar: (params: URLSearchParams) => void) {
    const siguientes = new URLSearchParams(searchParams);
    mutar(siguientes);
    setSearchParams(siguientes);
  }

  function elegirCategoria(id: number | null) {
    actualizarParams((params) => {
      if (id == null) params.delete("categoria");
      else params.set("categoria", String(id));
    });
  }

  // Checkbox de marca: si ya estaba, la saca; si no, la agrega.
  function toggleMarca(id: number) {
    setMarcasElegidas((actuales) =>
      actuales.includes(id) ? actuales.filter((marcaId) => marcaId !== id) : [...actuales, id],
    );
  }

  // Vuelve el listado al estado inicial: sin query y sin filtros locales.
  function limpiarFiltros() {
    setMarcasElegidas([]);
    setPrecioMin("");
    setPrecioMax("");
    setOrden("relevancia");
    setSearchParams({});
  }

  const titulo = q
    ? `Resultados para “${q}”`
    : categoriaActiva
      ? categoriaActiva.nombre
      : "Productos";

  return (
    <main className="page-shell">
      <div className="listing-head">
        <div>
          <h1>{titulo}</h1>
          <p>
            {cargando
              ? "Cargando…"
              : `${visibles.length} ${visibles.length === 1 ? "producto" : "productos"}`
                + (totalCatalogo != null && !hayFiltros ? ` · ${totalCatalogo} en el catálogo` : "")}
          </p>
        </div>
        <label>
          Ordenar
          <select
            value={orden}
            onChange={(event) => setOrden(event.target.value as Orden)}
          >
            <option value="relevancia">Recomendados</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
          </select>
        </label>
      </div>

      <div className="listing-layout">
        {/* Barra izquierda: categoría (URL), marca y precio (front) */}
        <aside className="filters">
          <div className="filter-title">
            <h2>Filtros</h2>
            {hayFiltros && (
              <button type="button" onClick={limpiarFiltros}>
                Limpiar
              </button>
            )}
          </div>

          <fieldset>
            <legend>Categoría</legend>
            <label>
              <input
                type="radio"
                name="categoria"
                checked={categoriaId == null}
                onChange={() => elegirCategoria(null)}
              />{" "}
              Todas
            </label>
            {categorias.map((categoria) => (
              <label key={categoria.categoriaId}>
                <input
                  type="radio"
                  name="categoria"
                  checked={categoriaId === categoria.categoriaId}
                  onChange={() => elegirCategoria(categoria.categoriaId)}
                />{" "}
                {categoria.nombre}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Marca</legend>
            {marcas.length === 0 ? (
              <span className="text-muted text-[11px]">No hay marcas cargadas</span>
            ) : (
              marcas.map((marca) => (
                <label key={marca.marcaId}>
                  <input
                    type="checkbox"
                    checked={marcasElegidas.includes(marca.marcaId)}
                    onChange={() => toggleMarca(marca.marcaId)}
                  />{" "}
                  {marca.nombre}
                </label>
              ))
            )}
          </fieldset>

          <fieldset>
            <legend>Precio</legend>
            <div className="price-inputs">
              <input
                type="number"
                min={0}
                placeholder="Mínimo"
                value={precioMin}
                onChange={(event) => setPrecioMin(event.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Máximo"
                value={precioMax}
                onChange={(event) => setPrecioMax(event.target.value)}
              />
            </div>
          </fieldset>
        </aside>

        <section>
          {/* Chips de los filtros activos. La × saca ese filtro nada más. */}
          {hayFiltros && !cargando && (
            <div className="active-filters">
              {q && (
                <span>
                  “{q}”
                  <button
                    type="button"
                    aria-label="Quitar búsqueda"
                    onClick={() => actualizarParams((params) => params.delete("q"))}
                  >
                    ×
                  </button>
                </span>
              )}
              {categoriaActiva && (
                <span>
                  {categoriaActiva.nombre}
                  <button
                    type="button"
                    aria-label="Quitar categoría"
                    onClick={() => elegirCategoria(null)}
                  >
                    ×
                  </button>
                </span>
              )}
              {marcas
                .filter((marca) => marcasElegidas.includes(marca.marcaId))
                .map((marca) => (
                  <span key={marca.marcaId}>
                    {marca.nombre}
                    <button
                      type="button"
                      aria-label={`Quitar ${marca.nombre}`}
                      onClick={() => toggleMarca(marca.marcaId)}
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          )}

          {cargando && <StateMessage title="Cargando productos…" />}

          {error && (
            <StateMessage title="No pudimos cargar los productos" text={error} />
          )}

          {!cargando && !error && visibles.length === 0 && (
            <StateMessage
              title="No encontramos productos"
              text="Probá con otra búsqueda o sacá algún filtro."
            />
          )}

          {!cargando && !error && visibles.length > 0 && (
            <div className="product-grid listing-grid">
              {visibles.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
