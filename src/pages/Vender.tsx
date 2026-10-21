// Publicar producto (T13) y editar publicación (T14).
// Rutas: /vender → producto nuevo · /vender/:id → editar un producto propio.
// El vendedor no se manda: el back lo toma del token.

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { getCategorias, getMarcas } from "../api/catalogo";
import { actualizarProducto, crearProducto, getMiProducto } from "../api/productos";
import Icon from "../components/Icon";
import StateMessage from "../components/StateMessage";
import type {
  Categoria,
  ImagenProductoRequest,
  Marca,
  Producto,
  UpdateProductoRequest,
} from "../dto/catalogo";

// Los inputs siempre trabajan con texto; recién al enviar se convierten a número.
type FormProducto = {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  sku: string;
  marcaId: string; // "" = sin elegir
  categoriaIds: number[];
  imagenes: { url: string; principal: boolean }[]; // el orden es la posición en la lista
};

const FORM_VACIO: FormProducto = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  sku: "",
  marcaId: "",
  categoriaIds: [],
  imagenes: [],
};

type Errores = Record<string, string>;

// Pasa un Producto del back al formato del formulario (para precargar la edición)
function productoAForm(producto: Producto): FormProducto {
  const imagenesOrdenadas = [...producto.imagenes].sort((a, b) => a.orden - b.orden);
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? "",
    precio: String(producto.precio),
    stock: String(producto.stock),
    sku: producto.sku ?? "",
    marcaId: producto.marcaId !== null ? String(producto.marcaId) : "",
    categoriaIds: [...producto.categoriaIds],
    imagenes: imagenesOrdenadas.map((imagen) => ({ url: imagen.url, principal: imagen.principal })),
  };
}

// Precio: acepta coma o punto como separador decimal ("1299,50" o "1299.50")
function parsePrecio(texto: string): number {
  return Number(texto.trim().replace(",", "."));
}

// La lista de imágenes tal como la espera el back: el orden sale de la posición
function imagenesARequest(imagenes: FormProducto["imagenes"]): ImagenProductoRequest[] {
  return imagenes.map((imagen, posicion) => ({
    url: imagen.url,
    orden: posicion,
    principal: imagen.principal,
  }));
}

function mismosIds(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const ordenadosA = [...a].sort((x, y) => x - y);
  const ordenadosB = [...b].sort((x, y) => x - y);
  return ordenadosA.every((id, i) => id === ordenadosB[i]);
}

export default function Vender() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Si la URL trae un id, estamos editando
  const productoId = id ? Number(id) : null;
  const editando = productoId !== null;

  const [form, setForm] = useState<FormProducto>(FORM_VACIO);
  // Copia de cómo vino el producto, para mandar en el PUT solo lo que cambió
  const [original, setOriginal] = useState<FormProducto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [nuevaUrl, setNuevaUrl] = useState("");

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Al entrar: opciones de categoría y marca, y si es edición, el producto
  useEffect(() => {
    if (editando && Number.isNaN(productoId)) {
      setErrorCarga("La dirección no corresponde a ninguna publicación.");
      setCargando(false);
      return;
    }

    Promise.all([getCategorias(), getMarcas(), editando ? getMiProducto(productoId) : Promise.resolve(null)])
      .then(([listaCategorias, listaMarcas, producto]) => {
        setCategorias(listaCategorias);
        setMarcas(listaMarcas);
        if (editando) {
          if (!producto) {
            setErrorCarga("No encontramos esta publicación entre tus productos.");
            return;
          }
          const datos = productoAForm(producto);
          setForm(datos);
          setOriginal(datos);
        }
      })
      .catch((error: Error) => setErrorCarga(error.message))
      .finally(() => setCargando(false));
  }, [editando, productoId]);

  // Un solo handler para los inputs de texto, usando el atributo "name"
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function toggleCategoria(categoriaId: number) {
    const yaEsta = form.categoriaIds.includes(categoriaId);
    setForm({
      ...form,
      categoriaIds: yaEsta
        ? form.categoriaIds.filter((actual) => actual !== categoriaId)
        : [...form.categoriaIds, categoriaId],
    });
  }

  function agregarImagen() {
    const url = nuevaUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setErrores({ ...errores, imagenes: "La URL tiene que empezar con http:// o https://" });
      return;
    }
    if (url.length > 500) {
      setErrores({ ...errores, imagenes: "La URL no puede superar los 500 caracteres" });
      return;
    }
    if (form.imagenes.some((imagen) => imagen.url === url)) {
      setErrores({ ...errores, imagenes: "Esa imagen ya está en la lista" });
      return;
    }
    // La primera imagen que se agrega queda como principal
    const esPrimera = form.imagenes.length === 0;
    setForm({ ...form, imagenes: [...form.imagenes, { url, principal: esPrimera }] });
    setNuevaUrl("");
    setErrores({ ...errores, imagenes: "" });
  }

  function quitarImagen(posicion: number) {
    const restantes = form.imagenes.filter((_, i) => i !== posicion);
    // Si sacamos la principal, pasa a serlo la primera que quede
    if (restantes.length > 0 && !restantes.some((imagen) => imagen.principal)) {
      restantes[0] = { ...restantes[0], principal: true };
    }
    setForm({ ...form, imagenes: restantes });
  }

  function marcarPrincipal(posicion: number) {
    setForm({
      ...form,
      imagenes: form.imagenes.map((imagen, i) => ({ ...imagen, principal: i === posicion })),
    });
  }

  function validar(): Errores {
    const nuevos: Errores = {};

    const nombre = form.nombre.trim();
    if (!nombre) nuevos.nombre = "El nombre es obligatorio";
    else if (nombre.length > 150) nuevos.nombre = "El nombre no puede superar los 150 caracteres";

    const precio = parsePrecio(form.precio);
    if (!form.precio.trim()) nuevos.precio = "El precio es obligatorio";
    else if (Number.isNaN(precio) || precio <= 0) nuevos.precio = "El precio debe ser mayor a 0";
    else if (precio >= 100_000_000) nuevos.precio = "El precio admite hasta 8 dígitos enteros";
    else if (!/^\d+([.,]\d{1,2})?$/.test(form.precio.trim())) nuevos.precio = "Usá como máximo 2 decimales";

    if (!form.stock.trim()) nuevos.stock = "El stock es obligatorio";
    else if (!/^\d+$/.test(form.stock.trim())) nuevos.stock = "El stock tiene que ser un número entero, 0 o más";

    const sku = form.sku.trim();
    if (!sku) nuevos.sku = "El SKU es obligatorio";
    else if (sku.length > 80) nuevos.sku = "El SKU no puede superar los 80 caracteres";

    if (!form.marcaId) nuevos.marcaId = "Elegí una marca";
    if (form.categoriaIds.length === 0) nuevos.categoriaIds = "Elegí al menos una categoría";
    if (form.imagenes.length === 0) nuevos.imagenes = "Agregá al menos una imagen";

    return nuevos;
  }

  // Para el PUT: solo los campos que cambiaron respecto de cómo vino el producto
  function armarCambios(anterior: FormProducto): UpdateProductoRequest {
    const cambios: UpdateProductoRequest = {};
    if (form.nombre.trim() !== anterior.nombre.trim()) cambios.nombre = form.nombre.trim();
    if (form.descripcion.trim() !== anterior.descripcion.trim()) cambios.descripcion = form.descripcion.trim();
    if (parsePrecio(form.precio) !== parsePrecio(anterior.precio)) cambios.precio = parsePrecio(form.precio);
    if (Number(form.stock) !== Number(anterior.stock)) cambios.stock = Number(form.stock);
    if (form.sku.trim() !== anterior.sku.trim()) cambios.sku = form.sku.trim();
    if (form.marcaId !== anterior.marcaId) cambios.marcaId = Number(form.marcaId);
    if (!mismosIds(form.categoriaIds, anterior.categoriaIds)) cambios.categoriaIds = form.categoriaIds;
    if (JSON.stringify(form.imagenes) !== JSON.stringify(anterior.imagenes)) {
      cambios.imagenes = imagenesARequest(form.imagenes);
    }
    return cambios;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrorGeneral("Revisá los campos marcados.");
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    try {
      if (editando && original && productoId !== null) {
        const cambios = armarCambios(original);
        if (Object.keys(cambios).length > 0) {
          await actualizarProducto(productoId, cambios);
        }
        navigate("/cuenta/publicaciones", { state: { mensaje: "Guardamos los cambios de tu publicación." } });
      } else {
        await crearProducto({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          precio: parsePrecio(form.precio),
          stock: Number(form.stock),
          sku: form.sku.trim(),
          marcaId: Number(form.marcaId),
          categoriaIds: form.categoriaIds,
          imagenes: imagenesARequest(form.imagenes),
        });
        navigate("/cuenta/publicaciones", { state: { mensaje: "¡Tu producto ya está publicado!" } });
      }
    } catch (error) {
      // 400 con detalle por campo: cada error cae debajo de su campo (los nombres coinciden con el back)
      if (error instanceof ApiError && error.errores) setErrores(error.errores);
      // 409 = SKU repetido, 403 = el producto no es tuyo
      setErrorGeneral(error instanceof Error ? error.message : "No pudimos guardar el producto.");
    } finally {
      setEnviando(false);
    }
  }

  function claseInput(campo: string) {
    return `input ${errores[campo] ? "input-error" : ""}`;
  }

  const titulo = editando ? "Editar publicación" : "Publicar producto";

  if (cargando) {
    return (
      <main className="page-shell">
        <StateMessage title="Cargando el formulario…" />
      </main>
    );
  }

  if (errorCarga) {
    return (
      <main className="page-shell">
        <div className="page-heading">
          <h1>{titulo}</h1>
        </div>
        <StateMessage title="No pudimos cargar el formulario" text={errorCarga} />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <span>VENDER</span>
        <h1>{titulo}</h1>
        <p>
          {editando
            ? "Cambiá lo que necesites. Solo se guardan los campos que modifiques."
            : "Completá los datos y tu producto aparece en el catálogo al instante."}
        </p>
      </div>

      <div className="sell-layout">
        <form className="form-card sell-form" onSubmit={handleSubmit} noValidate>
          <h2>Información del producto</h2>

          <label className="field">
            Nombre
            <input
              className={claseInput("nombre")}
              name="nombre"
              maxLength={150}
              placeholder="Ej: Notebook Lenovo IdeaPad 3 15″"
              value={form.nombre}
              onChange={handleChange}
            />
            {errores.nombre && <small>{errores.nombre}</small>}
          </label>

          <label className="field">
            Descripción
            <textarea
              className={`${claseInput("descripcion")} textarea`}
              name="descripcion"
              placeholder="Contá el estado, las características y qué incluye"
              value={form.descripcion}
              onChange={handleChange}
            />
            {errores.descripcion && <small>{errores.descripcion}</small>}
          </label>

          <div className="field-row">
            <label className="field">
              Marca
              <select className={claseInput("marcaId")} name="marcaId" value={form.marcaId} onChange={handleChange}>
                <option value="">Elegí una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.marcaId} value={marca.marcaId}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              {errores.marcaId && <small>{errores.marcaId}</small>}
            </label>

            <label className="field">
              SKU
              <input
                className={claseInput("sku")}
                name="sku"
                maxLength={80}
                placeholder="Código único, ej: LEN-IP3-15"
                value={form.sku}
                onChange={handleChange}
              />
              {errores.sku && <small>{errores.sku}</small>}
            </label>
          </div>

          <div className="field" role="group" aria-label="Categorías">
            <span>Categorías</span>
            {categorias.length === 0 ? (
              <p className="text-xs text-muted">No hay categorías cargadas en el back.</p>
            ) : (
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {categorias.map((categoria) => (
                  <label key={categoria.categoriaId} className="flex items-center gap-2 text-xs font-normal">
                    <input
                      type="checkbox"
                      checked={form.categoriaIds.includes(categoria.categoriaId)}
                      onChange={() => toggleCategoria(categoria.categoriaId)}
                    />
                    {categoria.nombre}
                  </label>
                ))}
              </div>
            )}
            {errores.categoriaIds && <small>{errores.categoriaIds}</small>}
          </div>

          <h2>Precio y stock</h2>

          <div className="field-row">
            <label className="field">
              Precio ($)
              <input
                className={claseInput("precio")}
                name="precio"
                inputMode="decimal"
                placeholder="0"
                value={form.precio}
                onChange={handleChange}
              />
              {errores.precio && <small>{errores.precio}</small>}
            </label>

            <label className="field">
              Stock
              <input
                className={claseInput("stock")}
                name="stock"
                inputMode="numeric"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
              />
              {errores.stock && <small>{errores.stock}</small>}
            </label>
          </div>

          <h2>Imágenes</h2>

          <div className="field-row items-end">
            <label className="field">
              URL de la imagen
              <input
                className={claseInput("imagenes")}
                type="url"
                placeholder="https://…"
                value={nuevaUrl}
                onChange={(event) => setNuevaUrl(event.target.value)}
                onKeyDown={(event) => {
                  // Enter agrega la imagen en vez de enviar todo el formulario
                  if (event.key === "Enter") {
                    event.preventDefault();
                    agregarImagen();
                  }
                }}
              />
              {errores.imagenes && <small>{errores.imagenes}</small>}
            </label>
            <button className="btn btn-secondary mb-[17px] h-11 shrink-0" type="button" onClick={agregarImagen}>
              Agregar
            </button>
          </div>

          {form.imagenes.length === 0 ? (
            <div className="upload">
              <span>
                <Icon name="package" />
              </span>
              <strong>Todavía no agregaste imágenes</strong>
              <small>Pegá la URL de una foto y tocá "Agregar". La primera queda como principal.</small>
            </div>
          ) : (
            <ul className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.imagenes.map((imagen, posicion) => (
                <li
                  key={imagen.url}
                  className={`overflow-hidden rounded-lg border ${
                    imagen.principal ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <img src={imagen.url} alt={`Imagen ${posicion + 1}`} className="h-28 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2 py-2 text-[10px]">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="principal"
                        checked={imagen.principal}
                        onChange={() => marcarPrincipal(posicion)}
                      />
                      Principal
                    </label>
                    <button type="button" className="text-danger" onClick={() => quitarImagen(posicion)}>
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* El error general va junto al botón, que es donde la persona está mirando al enviar */}
          {errorGeneral && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
              {errorGeneral}
            </p>
          )}

          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Publicar producto"}
            </button>
          </div>
        </form>

        <aside className="tips">
          <h3>Consejos para vender más</h3>
          <p>
            <Icon name="check" size={16} />
            Usá un nombre claro con marca y modelo.
          </p>
          <p>
            <Icon name="check" size={16} />
            Subí varias fotos y elegí como principal la que mejor muestre el producto.
          </p>
          <p>
            <Icon name="check" size={16} />
            Mantené el stock al día: si llega a 0, el producto no se puede comprar.
          </p>
          <p>
            <Icon name="check" size={16} />
            El SKU no se puede repetir con el de otro producto.
          </p>
        </aside>
      </div>
    </main>
  );
}
