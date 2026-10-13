// Header de la app. Cambia según la sesión
// - Sin sesión: botones "Ingresar" y "Crear cuenta".
// - Con sesión: avatar con iniciales, "Hola, nombre" y un menú con las secciones de la cuenta.

import { startTransition, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import Icon from "./Icon";

export default function Header() {
  const { usuario, logout } = useAuth();
  const { cantidad: cantidadCarrito } = useCarrito();
  const navigate = useNavigate();
  // useSearchParams lee la query de la URL actual (ej: /productos?q=notebook → "notebook").
  const [searchParams] = useSearchParams();
  const qEnUrl = searchParams.get("q") ?? "";

  // Estado: React "recuerda" lo que se escribe en el buscador entre un dibujado y otro.
  const [busqueda, setBusqueda] = useState(qEnUrl);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // useRef "apunta" a un elemento del HTML. Lo usamos para saber si un clic fue adentro o afuera del menú.
  const cuentaRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic en cualquier otra parte de la página
  useEffect(() => {
    if (!menuAbierto) return;

    function handleClickAfuera(event: MouseEvent) {
      if (cuentaRef.current && !cuentaRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, [menuAbierto]);

  // Si la URL ya trae ?q= (link compartido o filtro del listado), el input lo refleja.
  // Así, al recargar o usar "atrás", el buscador muestra el mismo texto que está en la URL.
  useEffect(() => {
    setBusqueda(qEnUrl);
  }, [qEnUrl]);

  // T6: el buscador no busca acá. Solo manda al listado con ?q=...
  // Productos.tsx lee ese parámetro y llama a GET /api/productos/buscar.
  function handleBuscar(event: FormEvent) {
    event.preventDefault(); // evita que el formulario recargue la página
    const texto = busqueda.trim();
    if (texto) {
      navigate(`/productos?q=${encodeURIComponent(texto)}`);
    } else {
      // Sin texto → listado completo, sin filtro de búsqueda
      navigate("/productos");
    }
  }

  // Cierra el menú y navega. Lo usan todas las opciones del menú.
  function irA(ruta: string) {
    setMenuAbierto(false);
    navigate(ruta);
  }

  function handleLogout() {
    setMenuAbierto(false);
    navigate("/");
    // React Router cambia de página dentro de una "transición" (actualización sin apuro).
    // Si el logout fuera urgente, React lo aplicaría ANTES de cambiar de página: estando en una
    // página privada (ej: /carrito), ProtectedRoute vería "sin sesión" y te mandaría al login.
    // Con startTransition, el cambio de página y el logout se aplican juntos.
    startTransition(() => logout());
  }

  const iniciales = usuario ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase() : "";

  return (
    <header>
      <div className="topbar">
        <Link className="logo no-underline" to="/">
          <span className="logo-mark">
            <span />
            <span />
            <span />
          </span>
          Campus<span>Tech</span>
        </Link>

        <form className="search" onSubmit={handleBuscar} role="search">
          <Icon name="search" />
          <input
            aria-label="Buscar productos"
            placeholder="Buscar notebooks, celulares, audio..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Buscar
          </button>
        </form>

        <div className="header-actions">
          <button className="mobile-menu" aria-label="Abrir menú">
            <Icon name="menu" />
          </button>
          <Link className="cart-button" to="/carrito" aria-label={`Carrito (${cantidadCarrito})`}>
            <Icon name="cart" size={23} />
            {cantidadCarrito > 0 && <span className="cart-count">{cantidadCarrito}</span>}
          </Link>

          {usuario ? (
            // ---- Con sesión ----
            <div className="account" ref={cuentaRef}>
              <button
                className="user-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuAbierto}
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                <span className="avatar">{iniciales}</span>
                <span className="user-copy">
                  Hola, {usuario.nombre}
                  <small>Mi cuenta</small>
                </span>
                <Icon name="chevron" size={15} />
              </button>

              {menuAbierto && (
                <div className="account-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => irA("/cuenta/perfil")}>
                    Mi perfil
                  </button>
                  <button type="button" role="menuitem" onClick={() => irA("/cuenta/compras")}>
                    Mis compras
                  </button>
                  <button type="button" role="menuitem" onClick={() => irA("/cuenta/publicaciones")}>
                    Mis publicaciones
                  </button>
                  <button type="button" role="menuitem" onClick={() => irA("/vender")}>
                    Vender
                  </button>
                  <button className="logout" type="button" role="menuitem" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ---- Sin sesión ----
            <div className="auth-actions">
              <Link className="btn btn-ghost no-underline" to="/login">
                Ingresar
              </Link>
              <Link className="btn btn-secondary no-underline" to="/registro">
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>

      <nav>
        <button>
          Categorías <Icon name="chevron" size={15} />
        </button>
        <button>Notebooks</button>
        <button>Celulares</button>
        <button>Gaming</button>
        <span />
        <button>Vendé en CampusTech</button>
      </nav>
    </header>
  );
}