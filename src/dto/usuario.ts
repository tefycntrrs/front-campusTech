// Enum Sexo de Java. En JSON viaja como texto, por eso acá es una unión de strings:
// TypeScript solo deja usar uno de estos cuatro valores.
export type Sexo = "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO_NO_DECIR";

// Lo que devuelven GET /api/usuarios/me, el registro y el login (dentro de "usuario").
// Nunca trae la contraseña.
export type UsuarioResponse = {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  fechaNacimiento: string; 
  edad: number | null;
  sexo: Sexo | null;
  activo: boolean;
  createdAt: string; 
  roles: string[];
};

// Body de POST /api/usuarios/login
export type LoginRequest = {
  email: string;
  password: string;
};

// Respuesta de POST /api/usuarios/login
export type LoginResponse = {
  mensaje: string;
  token: string; // el JWT que hay que mandar en "Authorization: Bearer <token>"
  tipo: string; // siempre "Bearer"
  expiraEnMs: number; // cuántos milisegundos dura el token desde ahora
  usuario: UsuarioResponse;
};

// Body de POST /api/usuarios/registro.
export type CreateUsuarioRequest = {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  sexo: Sexo;
};