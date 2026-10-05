// App: componente raíz. Define las rutas de la app, es decir, qué página se dibuja para cada URL.

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Carrito from "./pages/Carrito";
import CompraExitosa from "./pages/CompraExitosa";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProductoDetalle from "./pages/ProductoDetalle";
import Productos from "./pages/Productos";
import Registro from "./pages/Registro";
import Vender from "./pages/Vender";
import Compras from "./pages/cuenta/Compras";
import Perfil from "./pages/cuenta/Perfil";
import Publicaciones from "./pages/cuenta/Publicaciones";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Páginas con header y footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/compra-exitosa" element={<CompraExitosa />} />
          <Route path="/vender" element={<Vender />} />
          <Route path="/cuenta/perfil" element={<Perfil />} />
          <Route path="/cuenta/compras" element={<Compras />} />
          <Route path="/cuenta/publicaciones" element={<Publicaciones />} />
          {/* "*" atrapa cualquier URL que no coincida con las de arriba */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Login y registro van sin header ni footer, como en el prototipo */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}
