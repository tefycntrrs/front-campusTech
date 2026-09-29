# Plan de trabajo — front-campusTech

Objetivo: llevar el prototipo de Figma a una app React conectada a **back-campusTech**.
Regla central: cualquiera ve productos; carrito, compra y venta solo con sesión.

Referencia visual: el zip del prototipo de Figma (`src/App.tsx` tiene el markup de cada pantalla
y las clases CSS ya están en `src/index.css`).

## Fase 0 — Setup ✅
- [x] Proyecto React + Vite + TypeScript + Tailwind v4
- [x] Estilos del prototipo en `src/index.css` + colores de marca como utilidades Tailwind
- [x] Carpetas base y proxy `/api` → `localhost:8080`

## Fase 1 — Cimientos (conviene hacerla antes de repartir pantallas)
- [ ] Relevar endpoints y DTOs del back y escribir los tipos en `src/types`
- [ ] Cliente HTTP en `src/api` (base URL, headers, manejo de errores, token)
- [ ] Instalar React Router y definir las rutas de la app
- [ ] Componentes compartidos: Button, Field, Logo, Header, Footer, ProductCard
- [ ] Configurar CORS en Spring para `http://localhost:5173` (para cuando no se use el proxy)

## Fase 2 — Pantallas (una o dos por integrante)
| Módulo | Pantallas | Responsable |
|---|---|---|
| Auth | Login, Registro, modal "Iniciá sesión", rutas protegidas | |
| Catálogo | Home, Listado con filtros y paginación | |
| Producto | Detalle de producto | |
| Carrito | Carrito | |
| Compra | Checkout, Compra exitosa, Mis compras | |
| Vender | Publicar producto, Mis publicaciones, Mi perfil | |

Cada pantalla se considera terminada cuando:
- [ ] Consume el endpoint real del back (nada de datos hardcodeados)
- [ ] Muestra estados de carga, error y vacío
- [ ] Respeta el diseño del prototipo y funciona en mobile

## Fase 3 — Integración y calidad
- [ ] Flujo completo: visitante → registro → carrito → compra → publicar producto
- [ ] Errores de validación del back mostrados en los formularios
- [ ] Revisión responsive y accesibilidad (foco visible, labels)

## Fase 4 — Entrega
- [ ] README final con instrucciones para correr front + back
- [ ] `npm run build` sin errores
- [ ] Demo preparada
