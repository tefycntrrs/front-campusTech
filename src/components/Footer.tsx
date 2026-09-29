// Pie de página. Es estático: no recibe props ni tiene estado.

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer>
      <div>
        <span className="logo">
          Campus<span>Tech</span>
        </span>
        <p>La comunidad donde la tecnología encuentra nuevas manos.</p>
      </div>
      <div>
        <strong>Comprar</strong>
        <button>Cómo comprar</button>
        <button>Compra protegida</button>
      </div>
      <div>
        <strong>Vender</strong>
        <button>Publicar producto</button>
        <button>Consejos</button>
      </div>
      <div>
        <strong>Ayuda</strong>
        <button>Centro de ayuda</button>
        <button>Contacto</button>
        <button>Términos</button>
      </div>
      <span>© {anioActual} CampusTech</span>
    </footer>
  );
}