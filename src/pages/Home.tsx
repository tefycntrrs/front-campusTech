// Home: pantalla de inicio que ve cualquier visitante (con o sin sesión).
// Las secciones fijas (hero, beneficios, promo) están escritas acá;
// los productos y las categorías se piden al back cuando la pantalla aparece.

import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import StateMessage from "../components/StateMessage";
import { getCategorias, getProductos } from "../api/catalogo";
import type { Categoria, Producto } from "../dto/catalogo";

const benefits = [
  { icon: "truck", title: "Envíos a todo el país", text: "Recibí donde estés" },
  { icon: "shield", title: "Compra protegida", text: "Pagá con confianza" },
  { icon: "cart", title: "Hasta 12 cuotas", text: "Con tarjetas seleccionadas" },
];

// Símbolo para cada categoría según su nombre. Si el back trae una categoría
// que no está en esta lista, se usa el símbolo por defecto "◇".
const categorySymbols: Record<string, string> = {
  Notebooks: "▱",
  Celulares: "▯",
  Periféricos: "⌁",
  Componentes: "⬡",
  Audio: "◖",
  Gaming: "◇",
  Accesorios: "⊹",
};

const HERO_IMAGE = "https://images.unsplash.com/photo-1627691673558-cf76f304f273?w=900";
const PROMO_IMAGE = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900";

export default function Home() {
  // Estado de la pantalla: los datos que llegan del back y cómo va la carga.
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect con [] se ejecuta UNA vez, cuando el Home aparece en pantalla.
  useEffect(() => {
    // Promise.all pide productos y categorías al mismo tiempo y espera a que lleguen los dos.
    Promise.all([getProductos(), getCategorias()])
      .then(([productosRecibidos, categoriasRecibidas]) => {
        setProductos(productosRecibidos);
        setCategorias(categoriasRecibidas);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  // Los 4 publicados más recientemente (createdAt es texto ISO, se puede comparar como texto).
  const ultimosPublicados = [...productos]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">TECNO DAYS · HASTA 35% OFF</span>
          <h1>Tecnología que te lleva más lejos</h1>
          <p>
            Encontrá todo lo que necesitás para estudiar, crear y jugar. Envíos a todo el
            país.
          </p>
          <button className="btn btn-primary">
            Ver productos <Icon name="arrow" size={17} />
          </button>
          <div className="hero-dots">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <img alt="Notebook y tablet en oferta" src={HERO_IMAGE} />
          <div className="floating-card">
            <span>Ahorrá</span>
            <strong>35%</strong>
          </div>
        </div>
      </section>

      <section className="benefits">
        {benefits.map((benefit) => (
          <div key={benefit.title}>
            <Icon name={benefit.icon} />
            <span>
              <strong>{benefit.title}</strong>
              {benefit.text}
            </span>
          </div>
        ))}
      </section>

      {/* Mientras carga o si hubo error, mostramos un mensaje en lugar de las secciones con datos */}
      {cargando && (
        <section className="content-section">
          <StateMessage title="Cargando productos…" />
        </section>
      )}

      {error && (
        <section className="content-section">
          <StateMessage title="No pudimos cargar los productos" text={error} />
        </section>
      )}

      {!cargando && !error && (
        <>
          <section className="content-section">
            <SectionTitle title="Explorá por categoría" subtitle="TODO LO QUE BUSCÁS" />
            {categorias.length === 0 ? (
              <StateMessage title="Todavía no hay categorías" />
            ) : (
              <div className="categories">
                {categorias.map((categoria) => (
                  <button key={categoria.categoriaId}>
                    <span>{categorySymbols[categoria.nombre] ?? "◇"}</span>
                    {categoria.nombre}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="content-section">
            <SectionTitle title="Últimos publicados" subtitle="RECIÉN LLEGADOS" />
            {ultimosPublicados.length === 0 ? (
              <StateMessage
                title="Todavía no hay productos publicados"
                text="Cuando alguien publique un producto, va a aparecer acá."
              />
            ) : (
              <div className="product-grid">
                {ultimosPublicados.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="promo">
        <div>
          <span>RENOVÁ TU SETUP</span>
          <h2>Todo para tu espacio gaming</h2>
          <p>Periféricos, audio y accesorios seleccionados para jugar mejor.</p>
          <button className="btn btn-secondary">Descubrir gaming</button>
        </div>
        <img alt="Setup tecnológico" src={PROMO_IMAGE} />
      </section>

      {!cargando && !error && productos.length > 0 && (
        <section className="content-section">
          <SectionTitle title="Todo el catálogo" subtitle="ELEGÍ LO TUYO" />
          <div className="product-grid">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}