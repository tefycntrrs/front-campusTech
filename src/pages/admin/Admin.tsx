// Administración de categorías y marcas (T16). Ruta: /admin — solo usuarios con rol ADMIN (ver AdminRoute).
// Permite crear, editar y activar/desactivar. El back no tiene DELETE: "borrar" es desactivar.

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import {
  crearCategoria,
  crearMarca,
  editarCategoria,
  editarMarca,
  getTodasLasCategorias,
  getTodasLasMarcas,
} from "../../api/admin";
import StateMessage from "../../components/StateMessage";

type Pestania = "categorias" | "marcas";

// Categoria y Marca vienen con nombres de id distintos (categoriaId / marcaId) y solo la categoría
// tiene descripción. Las pasamos a este formato común para usar una sola tabla y un solo formulario.
type Fila = {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};

type FormFila = {
  nombre: string;
  descripcion: string;
};

const FORM_VACIO: FormFila = { nombre: "", descripcion: "" };

// Todo lo que cambia entre una pestaña y la otra
const CONFIG = {
  categorias: { singular: "categoría", plural: "categorías", tieneDescripcion: true },
  marcas: { singular: "marca", plural: "marcas", tieneDescripcion: false },
} as const;

async function cargarFilas(pestania: Pestania): Promise<Fila[]> {
  if (pestania === "categorias") {
    const categorias = await getTodasLasCategorias();
    return categorias.map((c) => ({ id: c.categoriaId, nombre: c.nombre, descripcion: c.descripcion, activo: c.activo }));
  }
  const marcas = await getTodasLasMarcas();
  return marcas.map((m) => ({ id: m.marcaId, nombre: m.nombre, descripcion: null, activo: m.activo }));
}

// Crea (id null) o edita (id con valor) y devuelve la fila actualizada.
// Siempre manda el objeto completo: el PUT del back no es parcial.
async function guardarFila(pestania: Pestania, id: number | null, fila: Omit<Fila, "id">): Promise<Fila> {
  if (pestania === "categorias") {
    const datos = { nombre: fila.nombre, descripcion: fila.descripcion, activo: fila.activo };
    const c = id === null ? await crearCategoria(datos) : await editarCategoria(id, datos);
    return { id: c.categoriaId, nombre: c.nombre, descripcion: c.descripcion, activo: c.activo };
  }
  const datos = { nombre: fila.nombre, activo: fila.activo };
  const m = id === null ? await crearMarca(datos) : await editarMarca(id, datos);
  return { id: m.marcaId, nombre: m.nombre, descripcion: null, activo: m.activo };
}

function mensajeDeError(err: unknown, accion: string): string {
  // 403: la sesión es de un usuario sin rol ADMIN (por ejemplo, le sacaron el rol después de entrar)
  if (err instanceof ApiError && err.status === 403) return "No tenés permiso para hacer cambios en el catálogo.";
  return err instanceof Error ? err.message : `No pudimos ${accion}.`;
}

export default function Admin() {
  const [pestania, setPestania] = useState<Pestania>("categorias");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario: editandoId null = alta de una nueva
  const [form, setForm] = useState<FormFila>(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const config = CONFIG[pestania];

  // Cada vez que se cambia de pestaña, cargamos esa lista y limpiamos el formulario y los mensajes
  useEffect(() => {
    let cancelado = false; // si se cambia de pestaña antes de que responda el back, ignoramos la respuesta vieja
    setCargando(true);
    setError(null);
    setFilas([]);
    cancelarEdicion();
    setMensaje(null);
    setErrorAccion(null);

    cargarFilas(pestania)
      .then((lista) => {
        if (!cancelado) setFilas([...lista].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      })
      .catch((err: Error) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pestania]);

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrorNombre(null);
  }

  function empezarEdicion(fila: Fila) {
    setEditandoId(fila.id);
    setForm({ nombre: fila.nombre, descripcion: fila.descripcion ?? "" });
    setErrorNombre(null);
    setMensaje(null);
    setErrorAccion(null);
  }

  // Agrega la fila nueva o reemplaza la editada, manteniendo el orden alfabético
  function actualizarLista(guardada: Fila) {
    setFilas((actuales) =>
      [...actuales.filter((fila) => fila.id !== guardada.id), guardada].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();

    // Las mismas reglas que valida el back (CategoriaRequest / MarcaRequest)
    if (!nombre) return setErrorNombre("El nombre es obligatorio.");
    if (nombre.length > 100) return setErrorNombre("El nombre no puede superar los 100 caracteres.");
    if (descripcion.length > 255) return setErrorNombre("La descripción no puede superar los 255 caracteres.");

    setGuardando(true);
    setErrorNombre(null);
    setMensaje(null);
    setErrorAccion(null);
    try {
      // Al editar conservamos el estado que tenía; al crear, arranca activa
      const activo = editandoId === null ? true : (filas.find((fila) => fila.id === editandoId)?.activo ?? true);
      const guardada = await guardarFila(pestania, editandoId, {
        nombre,
        descripcion: config.tieneDescripcion ? descripcion || null : null,
        activo,
      });
      actualizarLista(guardada);
      setMensaje(editandoId === null ? `Se creó "${guardada.nombre}".` : `Se guardaron los cambios de "${guardada.nombre}".`);
      cancelarEdicion();
    } catch (err) {
      // 409 = nombre repetido: lo mostramos junto al campo, que es donde está el problema
      if (err instanceof ApiError && err.status === 409) setErrorNombre(err.message);
      else setErrorAccion(mensajeDeError(err, `guardar la ${config.singular}`));
    } finally {
      setGuardando(false);
    }
  }

  async function activarODesactivar(fila: Fila) {
    const activar = !fila.activo;
    if (!activar && !window.confirm(`¿Desactivar "${fila.nombre}"? Deja de aparecer en el catálogo y en los filtros.`)) {
      return;
    }

    setProcesandoId(fila.id);
    setMensaje(null);
    setErrorAccion(null);
    try {
      const guardada = await guardarFila(pestania, fila.id, { ...fila, activo: activar });
      actualizarLista(guardada);
      setMensaje(activar ? `"${guardada.nombre}" está activa otra vez.` : `"${guardada.nombre}" quedó desactivada.`);
    } catch (err) {
      setErrorAccion(mensajeDeError(err, `cambiar el estado de la ${config.singular}`));
    } finally {
      setProcesandoId(null);
    }
  }

  // Columnas de la tabla. Va como style porque .table-row del prototipo fija 5 columnas
  // y las clases de Tailwind no le ganan a ese CSS.
  const columnas = config.tieneDescripcion ? "1.2fr 2fr .7fr .9fr" : "2fr .7fr .9fr";

  return (
    <main className="page-shell">
      <div className="page-heading">
        <h1>Administración</h1>
        <p>Categorías y marcas del catálogo. Lo que desactives deja de verse en el Home y en los filtros.</p>
      </div>

      <div className="mb-6 flex gap-2" role="tablist">
        {(Object.keys(CONFIG) as Pestania[]).map((clave) => (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={pestania === clave}
            className={`btn ${pestania === clave ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setPestania(clave)}
          >
            {clave === "categorias" ? "Categorías" : "Marcas"}
          </button>
        ))}
      </div>

      <form className="form-card mb-6" onSubmit={handleSubmit} noValidate>
        <h2>{editandoId === null ? `Nueva ${config.singular}` : `Editar ${config.singular}`}</h2>

        <div className={config.tieneDescripcion ? "field-row" : undefined}>
          <label className="field">
            Nombre
            <input
              className={`input ${errorNombre ? "input-error" : ""}`}
              value={form.nombre}
              maxLength={100}
              onChange={(event) => setForm({ ...form, nombre: event.target.value })}
            />
            {errorNombre && <small>{errorNombre}</small>}
          </label>

          {config.tieneDescripcion && (
            <label className="field">
              Descripción (opcional)
              <input
                className="input"
                value={form.descripcion}
                maxLength={255}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
              />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {editandoId !== null && (
            <button className="btn btn-secondary" type="button" onClick={cancelarEdicion} disabled={guardando}>
              Cancelar
            </button>
          )}
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : editandoId === null ? `Crear ${config.singular}` : "Guardar cambios"}
          </button>
        </div>
      </form>

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

      {cargando && <StateMessage title={`Cargando ${config.plural}…`} />}
      {error && <StateMessage title={`No pudimos cargar las ${config.plural}`} text={error} />}
      {!cargando && !error && filas.length === 0 && (
        <StateMessage title={`Todavía no hay ${config.plural}`} text="Creá la primera con el formulario de arriba." />
      )}

      {!cargando && !error && filas.length > 0 && (
        <div className="table w-full" /* w-full: Tailwind también tiene una clase "table" (display: table) que la achica */>
          <div className="table-row table-head" style={{ gridTemplateColumns: columnas }}>
            <span>Nombre</span>
            {config.tieneDescripcion && <span>Descripción</span>}
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {filas.map((fila) => {
            const ocupado = procesandoId === fila.id || guardando;
            return (
              <div className="table-row" key={fila.id} style={{ gridTemplateColumns: columnas, minHeight: 56 }}>
                <strong>{fila.nombre}</strong>
                {config.tieneDescripcion && <span className="text-muted">{fila.descripcion || "—"}</span>}
                <span>
                  <i className={fila.activo ? "status" : "status paused"}>{fila.activo ? "Activa" : "Inactiva"}</i>
                </span>
                <div className="row-actions">
                  <button type="button" disabled={ocupado} onClick={() => empezarEdicion(fila)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={fila.activo ? "!text-danger" : undefined}
                    disabled={ocupado}
                    onClick={() => activarODesactivar(fila)}
                  >
                    {fila.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
