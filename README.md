# front-campusTech

Front del e-commerce **CampusTech** (TPO Aplicaciones Interactivas — UADE, Grupo 1).
React + Vite + TypeScript + Tailwind CSS. Consume la API de `back-campusTech`.

## Requisitos
- Node.js 20.19 o superior

## Cómo correrlo
```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

Con el back levantado en `http://localhost:8080`, Vite reenvía todo lo que empiece
con `/api` (ver `vite.config.ts`), así no hay problemas de CORS en desarrollo.

## Estructura
```
src/
  api/         llamadas HTTP al back (un archivo por recurso)
  components/  piezas reutilizables (Header, ProductCard, ...)
  context/     estado global (sesión, carrito, ...)
  pages/       una pantalla por archivo
  types/       tipos que reflejan los DTOs del back
  utils/       funciones de ayuda
  index.css    estilos del prototipo de Figma + colores de marca para Tailwind
```

## Colores de marca (utilidades Tailwind)
`bg-primary` `bg-navy` `bg-blue-light` `bg-blue-pale` `text-muted` `text-ink` `text-success` `text-danger`

Plan de trabajo en [TAREAS.md](./TAREAS.md).
