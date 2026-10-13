// Tipos de compras: espejo de los DTOs del back.

export type EstadoCarrito = "ACTIVO" | "FINALIZADO";

export type EstadoPedido = "CONFIRMADO" | "CANCELADO";

export type ItemCarritoResponse = {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  stockDisponible: number;
  precioReferencia: number;
  subtotal: number;
};

export type CarritoResponse = {
  id: number;
  estado: EstadoCarrito;
  usuarioId: number | null;
  items: ItemCarritoResponse[];
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type AgregarItemCarritoRequest = {
  productoId: number;
  cantidad: number;
};

export type DetallePedidoResponse = {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type PedidoResponse = {
  id: number;
  numero: string;
  estado: EstadoPedido;
  usuarioId: number | null;
  detalles: DetallePedidoResponse[];
  subtotal: number;
  total: number;
  createdAt: string;
};
