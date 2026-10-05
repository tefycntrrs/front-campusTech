// Al cambiar de página, vuelve el scroll arriba. Sin esto, la página nueva
// arrancaría a la misma altura en la que quedó la anterior.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "instant" porque index.css tiene scroll-behavior: smooth y acá no queremos la animación
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null; // no dibuja nada
}
