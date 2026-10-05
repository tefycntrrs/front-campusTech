// Layout común: header arriba, footer abajo y en el medio la página de la ruta actual.
// Al navegar solo cambia lo que dibuja <Outlet />: el header y el footer quedan montados.

import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
