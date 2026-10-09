// App: componente raíz. Define las rutas de la app, es decir, qué página se dibuja para cada URL.

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
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
      {/* AuthProvider envuelve todo: así cualquier página o componente puede usar useAuth() */}
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Páginas con header y footer */}
          <Route element={<Layout />}>
            {/* Públicas: las ve cualquier visitante */}
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:id" element={<ProductoDetalle />} />

            {/* Privadas: ProtectedRoute las deja pasar solo con sesión; si no, manda al login */}
            <Route element={<ProtectedRoute />}>
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/compra-exitosa" element={<CompraExitosa />} />
              <Route path="/vender" element={<Vender />} />
              <Route path="/cuenta/perfil" element={<Perfil />} />
              <Route path="/cuenta/compras" element={<Compras />} />
              <Route path="/cuenta/publicaciones" element={<Publicaciones />} />
            </Route>

            {/* "*" atrapa cualquier URL que no coincida con las de arriba */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Login y registro van sin header ni footer, como en el prototipo */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}