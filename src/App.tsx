// App: componente raíz. Arma la estructura de la página: header, contenido y footer.

import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";

export default function App() {
  return (
    <>
      <Header />
      <Home />
      <Footer />
    </>
  );
}