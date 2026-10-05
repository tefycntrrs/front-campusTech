// Página 404: se muestra cuando la URL no coincide con ninguna ruta de App.tsx.

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="empty-state">
      <h1>No encontramos esta página</h1>
      <p>La dirección que ingresaste no existe o cambió de lugar.</p>
      <Link className="btn btn-primary" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}
