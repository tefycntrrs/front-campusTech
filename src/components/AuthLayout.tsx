// Marco común de las pantallas de login y registro (diseño del prototipo):
// a la izquierda el logo y el formulario, a la derecha una imagen con un mensaje.
// En celular la imagen se oculta (lo resuelve index.css con .auth-art).
//
// "children" es lo que se escribe ENTRE las etiquetas: <AuthLayout> esto </AuthLayout>

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="logo no-underline" to="/">
          <span className="logo-mark">
            <span />
            <span />
            <span />
          </span>
          Campus<span>Tech</span>
        </Link>

        {children}
      </section>

      <aside className="auth-art">
        <div>
          <span>TECNOLOGÍA ENTRE ESTUDIANTES</span>
          <h2>Comprá y vendé tecnología en tu campus.</h2>
          <p>Notebooks, celulares, audio y gaming publicados por la comunidad CampusTech.</p>
        </div>
      </aside>
    </main>
  );
}