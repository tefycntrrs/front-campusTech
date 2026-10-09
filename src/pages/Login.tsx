// Login Ruta: /login. Va sin header ni footer, como en el prototipo.
// Si llegaste acá redirigida desde una página privada, al ingresar te devuelve a esa página.

import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

// Formato básico de email: algo@algo.algo, sin espacios
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Errores por campo: { email: "El email es obligatorio" }
type Errores = Record<string, string>;

export default function Login() {
  const { login, estaLogueado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Página a la que hay que volver después de ingresar. La manda ProtectedRoute o el LoginModal.
  // Si entraste directo a /login no hay "from" y vamos al inicio.
  const desde = (location.state as { from?: string } | null)?.from ?? "/";

  // Un estado por cada dato que cambia en pantalla
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, el login no tiene sentido: lo mandamos a donde iba.
  if (estaLogueado) {
    return <Navigate to={desde} replace />;
  }

  function validar(): Errores {
    const nuevos: Errores = {};
    if (!email.trim()) nuevos.email = "El email es obligatorio";
    else if (!EMAIL_REGEX.test(email.trim())) nuevos.email = "El email no tiene un formato válido";
    if (!password) nuevos.password = "La contraseña es obligatoria";
    return nuevos;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); // sin esto, el navegador recarga la página al enviar el form

    // 1) Validamos en el front: si algo está mal, ni llamamos al back.
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // 2) Llamamos al back
    setEnviando(true);
    setErrorGeneral(null);
    try {
      await login(email.trim(), password);
      navigate(desde, { replace: true });
    } catch (error) {
      // ApiError extiende Error, así que acá llega el "message" real del back,
      // por ejemplo "Email o contraseña incorrectos" (401).
      setErrorGeneral(error instanceof Error ? error.message : "No pudimos iniciar sesión.");
    } finally {
      setEnviando(false); // finally se ejecuta siempre: haya salido bien o mal
    }
  }

  return (
    <AuthLayout>
      <div className="auth-heading">
        <div className="auth-icon">
          <Icon name="user" size={26} />
        </div>
        <h1>Ingresar</h1>
        <p>Usá tu email y contraseña de CampusTech.</p>
      </div>

      {/* noValidate: desactiva los globitos de error del navegador, mostramos los nuestros */}
      <form onSubmit={handleSubmit} noValidate>
        {errorGeneral && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger" role="alert">
            {errorGeneral}
          </p>
        )}

        <label className="field">
          Email
          <input
            className={`input ${errores.email ? "input-error" : ""}`}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errores.email && <small>{errores.email}</small>}
        </label>

        <label className="field">
          Contraseña
          <input
            className={`input ${errores.password ? "input-error" : ""}`}
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errores.password && <small>{errores.password}</small>}
        </label>

        <button className="btn btn-primary full large" type="submit" disabled={enviando}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tenés cuenta?{" "}
        {/* Pasamos el mismo "from" para que el registro también devuelva a la página original */}
        <button type="button" onClick={() => navigate("/registro", { state: { from: desde } })}>
          Creá una cuenta
        </button>
      </p>
    </AuthLayout>
  );
}