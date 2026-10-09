// Modal "Iniciá sesión para continuar". Se muestra cuando un visitante intenta hacer algo
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";

type LoginModalProps = {
  onClose: () => void; // la página decide qué hacer al cerrar (normalmente, ocultar el modal)
};

export default function LoginModal({ onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mandamos la página actual como "from" para volver acá después de ingresar o registrarse.
  const desde = location.pathname + location.search;

  // Cerrar con la tecla Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    // Clic en el fondo oscuro = cerrar
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation: un clic ADENTRO del modal no tiene que llegar al fondo y cerrarlo */}
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="Cerrar" onClick={onClose}>
          <Icon name="close" />
        </button>

        <div className="modal-icon">
          <Icon name="lock" size={26} />
        </div>
        <h2 id="login-modal-titulo">Iniciá sesión para continuar</h2>
        <p>Para comprar o agregar productos al carrito necesitás una cuenta en CampusTech.</p>

        <button
          className="btn btn-primary full"
          type="button"
          onClick={() => navigate("/login", { state: { from: desde } })}
        >
          Ingresar
        </button>
        <button
          className="btn btn-secondary full"
          type="button"
          onClick={() => navigate("/registro", { state: { from: desde } })}
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}