// Header para visitantes (sin sesión).
// Más adelante, cuando exista el login, va a mostrar el usuario en lugar de "Ingresar / Crear cuenta".

import { useState, type FormEvent } from "react";
import Icon from "./Icon";

export default function Header() {
  // Estado: React "recuerda" lo que se escribe en el buscador entre un dibujado y otro.
  const [busqueda, setBusqueda] = useState("");

  function handleBuscar(event: FormEvent) {
    event.preventDefault(); // evita que el formulario recargue la página
    // TODO: cuando exista la página de listado, navegar a ella con la búsqueda.
    console.log("Buscar:", busqueda);
  }

  return (
    <header>
      <div className="topbar">
        <a className="logo no-underline" href="/">
          <span className="logo-mark">
            <span />
            <span />
            <span />
          </span>
          Campus<span>Tech</span>
        </a>

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
          <button className="cart-button" aria-label="Carrito">
            <Icon name="cart" size={23} />
          </button>
          <div className="auth-actions">
            <button className="btn btn-ghost">Ingresar</button>
            <button className="btn btn-secondary">Crear cuenta</button>
          </div>
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