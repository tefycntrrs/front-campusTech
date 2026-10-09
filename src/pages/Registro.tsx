// Registro  Ruta: /registro. Va sin header ni footer, como en el prototipo.
// Al crear la cuenta inicia sesión automáticamente y vuelve a la página de origen.

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import type { Sexo } from "../dto/usuario";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Misma regla que el back (@Pattern de CreateUsuarioRequest): letras, números, punto, guion y guion bajo
const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

// Opciones del select de sexo: "valor" es lo que se manda al back, "texto" lo que ve la persona.
// No hay opción de rol: el back no deja elegir ADMIN en el registro.
const OPCIONES_SEXO: { valor: Sexo; texto: string }[] = [
  { valor: "FEMENINO", texto: "Femenino" },
  { valor: "MASCULINO", texto: "Masculino" },
  { valor: "OTRO", texto: "Otro" },
  { valor: "PREFIERO_NO_DECIR", texto: "Prefiero no decir" },
];

// Todos los campos del formulario en un solo objeto.
// "confirmarPassword" existe solo en el front: no se manda al back.
type FormRegistro = {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  fechaNacimiento: string;
  sexo: Sexo | ""; // "" = todavía no eligió nada
  password: string;
  confirmarPassword: string;
};

const FORM_VACIO: FormRegistro = {
  nombre: "",
  apellido: "",
  username: "",
  email: "",
  fechaNacimiento: "",
  sexo: "",
  password: "",
  confirmarPassword: "",
};

type Errores = Record<string, string>;

// Fecha de hoy en formato "yyyy-MM-dd" (hora local), el mismo formato que usa <input type="date">
function hoy(): string {
  const fecha = new Date();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // getMonth() va de 0 a 11
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export default function Registro() {
  const { registrar, estaLogueado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const desde = (location.state as { from?: string } | null)?.from ?? "/";

  const [form, setForm] = useState<FormRegistro>(FORM_VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (estaLogueado) {
    return <Navigate to={desde} replace />;
  }

  // Un solo handler para todos los campos: usa el atributo "name" del input
  // para saber qué propiedad del objeto "form" actualizar.
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    // ...form copia todos los campos y [name]: value pisa solo el que cambió
    setForm({ ...form, [name]: value });
  }

  function validar(): Errores {
    const nuevos: Errores = {};

    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) nuevos.apellido = "El apellido es obligatorio";

    const username = form.username.trim();
    if (!username) nuevos.username = "El username es obligatorio";
    else if (username.length < 3 || username.length > 50)
      nuevos.username = "El username debe tener entre 3 y 50 caracteres";
    else if (!USERNAME_REGEX.test(username))
      nuevos.username = "Solo letras, números, puntos, guiones y guiones bajos";

    if (!form.email.trim()) nuevos.email = "El email es obligatorio";
    else if (!EMAIL_REGEX.test(form.email.trim())) nuevos.email = "El email no tiene un formato válido";

    if (!form.fechaNacimiento) nuevos.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    // Los textos "yyyy-MM-dd" se pueden comparar como texto: "2003-05-20" < "2026-10-08"
    else if (form.fechaNacimiento >= hoy()) nuevos.fechaNacimiento = "La fecha debe ser anterior a hoy";

    if (!form.sexo) nuevos.sexo = "Elegí una opción";

    if (!form.password) nuevos.password = "La contraseña es obligatoria";
    else if (form.password.length < 8 || form.password.length > 72)
      nuevos.password = "La contraseña debe tener entre 8 y 72 caracteres";

    if (form.confirmarPassword !== form.password) nuevos.confirmarPassword = "Las contraseñas no coinciden";

    return nuevos;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    setErrorGeneral(null);
    try {
      // Armamos el body que espera el back (CreateUsuarioRequest), sin confirmarPassword.
      // "as Sexo": ya validamos que no está vacío, se lo aseguramos a TypeScript.
      await registrar({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        fechaNacimiento: form.fechaNacimiento,
        sexo: form.sexo as Sexo,
        password: form.password,
      });
      navigate(desde, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.errores) {
        // 400 con detalle por campo, ej: { fechaNacimiento: "El usuario debe tener al menos 13 años" }.
        // Los nombres coinciden con los "name" de los inputs, así que cada error cae debajo de su campo.
        setErrores(error.errores);
      }
      // 409 = email o username repetidos: "Ya existe Usuario con email '...'"
      setErrorGeneral(error instanceof Error ? error.message : "No pudimos crear la cuenta.");
    } finally {
      setEnviando(false);
    }
  }

  // Para no repetir el mismo className en cada input
  function claseInput(campo: string) {
    return `input ${errores[campo] ? "input-error" : ""}`;
  }

  return (
    <AuthLayout>
      <div className="auth-heading">
        <div className="auth-icon">
          <Icon name="user" size={26} />
        </div>
        <h1>Crear cuenta</h1>
        <p>Registrate para comprar y publicar productos.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {errorGeneral && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="field-row">
          <label className="field">
            Nombre
            <input
              className={claseInput("nombre")}
              name="nombre"
              autoComplete="given-name"
              value={form.nombre}
              onChange={handleChange}
            />
            {errores.nombre && <small>{errores.nombre}</small>}
          </label>

          <label className="field">
            Apellido
            <input
              className={claseInput("apellido")}
              name="apellido"
              autoComplete="family-name"
              value={form.apellido}
              onChange={handleChange}
            />
            {errores.apellido && <small>{errores.apellido}</small>}
          </label>
        </div>

        <label className="field">
          Username
          <input
            className={claseInput("username")}
            name="username"
            autoComplete="username"
            placeholder="Así te van a ver los demás"
            value={form.username}
            onChange={handleChange}
          />
          {errores.username && <small>{errores.username}</small>}
        </label>

        <label className="field">
          Email
          <input
            className={claseInput("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
          />
          {errores.email && <small>{errores.email}</small>}
        </label>

        <div className="field-row">
          <label className="field">
            Fecha de nacimiento
            {/* type="date" ya entrega el valor como "yyyy-MM-dd", justo lo que espera el back */}
            <input
              className={claseInput("fechaNacimiento")}
              name="fechaNacimiento"
              type="date"
              max={hoy()}
              value={form.fechaNacimiento}
              onChange={handleChange}
            />
            {errores.fechaNacimiento && <small>{errores.fechaNacimiento}</small>}
          </label>

          <label className="field">
            Sexo
            <select className={claseInput("sexo")} name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Elegí una opción</option>
              {OPCIONES_SEXO.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.texto}
                </option>
              ))}
            </select>
            {errores.sexo && <small>{errores.sexo}</small>}
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            Contraseña
            <input
              className={claseInput("password")}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
            />
            {errores.password && <small>{errores.password}</small>}
          </label>

          <label className="field">
            Repetir contraseña
            <input
              className={claseInput("confirmarPassword")}
              name="confirmarPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmarPassword}
              onChange={handleChange}
            />
            {errores.confirmarPassword && <small>{errores.confirmarPassword}</small>}
          </label>
        </div>

        <button className="btn btn-primary full large" type="submit" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tenés cuenta?{" "}
        <button type="button" onClick={() => navigate("/login", { state: { from: desde } })}>
          Ingresá
        </button>
      </p>
    </AuthLayout>
  );
}