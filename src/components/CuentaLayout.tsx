// Layout de "Mi cuenta": menú lateral y el contenido de cada sección.

import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SECCIONES = [
  { ruta: "/cuenta/perfil", texto: "Mi perfil" },
  { ruta: "/cuenta/compras", texto: "Mis compras" },
  { ruta: "/cuenta/publicaciones", texto: "Mis publicaciones" },
];

export default function CuentaLayout({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const iniciales = usuario ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase() : "";

  return (
    <main className="page-shell">
      <div className="dashboard">
        <aside className="dash-nav">
          <div className="dash-user">
            <span className="avatar large-avatar">{iniciales}</span>
            <div>
              <strong>
                {usuario?.nombre} {usuario?.apellido}
              </strong>
              <small>{usuario?.email}</small>
            </div>
          </div>
          {SECCIONES.map((seccion) => (
            <button
              key={seccion.ruta}
              type="button"
              className={pathname === seccion.ruta ? "active" : undefined}
              onClick={() => navigate(seccion.ruta)}
            >
              {seccion.texto}
            </button>
          ))}
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
