// Título de sección reutilizable: "subtitle" en azul chiquito arriba y "title" grande abajo.

type SectionTitleProps = {
  title: string;
  subtitle?: string; // opcional: algunas secciones no lo tienen
};

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="section-title">
      <div>
        {/* Solo se dibuja el <p> si hay subtitle: "condición && JSX" */}
        {subtitle && <p>{subtitle}</p>}
        <h2>{title}</h2>
      </div>
    </div>
  );
}