// Ruta solo para administradores (T16). Va adentro de <ProtectedRoute>, así que acá ya hay sesión:
// solo falta revisar que el usuario tenga el rol ADMIN.
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StateMessage from "./StateMessage";

// Lo usan también el Header (para mostrar u ocultar "Administración") y la página de admin.
export function esAdmin(roles: string[] | undefined): boolean {
  return roles?.includes("ADMIN") ?? false;
}

export default function AdminRoute() {
  const { usuario } = useAuth();

  // Logueado pero sin permiso: es el mismo caso que el 403 del back.
  // No lo mandamos al login porque ya ingresó; le explicamos qué pasa.
  if (!esAdmin(usuario?.roles)) {
    return (
      <main className="page-shell">
        <StateMessage
          title="No tenés permiso para ver esta página"
          text="La administración de categorías y marcas es solo para usuarios administradores."
        />
        <p className="mt-5 text-center">
          <Link className="btn btn-primary no-underline" to="/">
            Volver al inicio
          </Link>
        </p>
      </main>
    );
  }

  return <Outlet />;
}
