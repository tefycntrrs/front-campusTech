// Mensaje para los estados de "cargando", "error" y "vacío".
// Está hecho con clases de Tailwind (no con el CSS del prototipo) como ejemplo de cómo usarlas.

type StateMessageProps = {
  title: string;
  text?: string;
};

export default function StateMessage({ title, text }: StateMessageProps) {
  return (
    <div className="rounded-xl bg-blue-pale px-6 py-12 text-center">
      <strong className="block text-lg text-navy">{title}</strong>
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
    </div>
  );
}