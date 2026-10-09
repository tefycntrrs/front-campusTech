// Ruta protegida: deja pasar solo si hay sesión. Se usa en App.tsx envolviendo las rutas privadas.
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StateMessage from "./StateMessage";

export default function ProtectedRoute() {
  const { estaLogueado, cargando } = useAuth();
  const location = useLocation();

  // Al recargar la página todavía estamos preguntándole al back si el token sirve.
  if (cargando) {
    return (
      <main className="page-shell">
        <StateMessage title="Cargando tu sesión..." />
      </main>
    );
  }

  if (!estaLogueado) {
    // replace: reemplaza la entrada del historial, así el botón "atrás" no te trae de nuevo acá.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Hay sesión: <Outlet /> dibuja la ruta hija que corresponde (Carrito, Vender, etc.)
  return <Outlet />;
}