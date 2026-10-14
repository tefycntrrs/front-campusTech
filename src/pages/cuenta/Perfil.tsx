// Datos del usuario logueado (T15). Ruta: /cuenta/perfil
// Es de solo lectura: el back no tiene un endpoint para editar el perfil.

import { useEffect, useState } from "react";
import { getUsuarioActual } from "../../api/usuarios";
import CuentaLayout from "../../components/CuentaLayout";
import StateMessage from "../../components/StateMessage";
import type { Sexo, UsuarioResponse } from "../../dto/usuario";
import { formatDate } from "../../utils/format";

const TEXTO_SEXO: Record<Sexo, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  OTRO: "Otro",
  PREFIERO_NO_DECIR: "Prefiero no decir",
};

// "2003-05-20" → "20 de mayo de 2003".
// Se arma la fecha con año, mes y día por separado: new Date("2003-05-20") la toma en UTC
// y en Argentina (UTC-3) se mostraría un día antes.
function formatFechaNacimiento(valor: string): string {
  const [anio, mes, dia] = valor.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Un dato del perfil con el mismo estilo que los campos de los formularios, pero sin poder editarlo
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <label className="field">
      {etiqueta}
      <input className="input bg-blue-pale" value={valor} readOnly />
    </label>
  );
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pedimos los datos al back en vez de usar los del login, así siempre están actualizados
  useEffect(() => {
    getUsuarioActual()
      .then(setUsuario)
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <CuentaLayout>
      <div className="page-heading">
        <h1>Mi perfil</h1>
        <p>Tus datos de CampusTech.</p>
      </div>

      {cargando && <StateMessage title="Cargando tu perfil…" />}
      {error && <StateMessage title="No pudimos cargar tu perfil" text={error} />}

      {usuario && (
        <div className="form-card profile-form">
          <div className="profile-avatar">
            <span className="avatar profile">
              {`${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()}
            </span>
            <div>
              <strong className="text-sm text-navy">
                {usuario.nombre} {usuario.apellido}
              </strong>
              <span className="text-muted">@{usuario.username}</span>
              {usuario.roles.includes("ADMIN") && <i className="status shipping w-max">Administrador</i>}
            </div>
          </div>

          <div className="field-row">
            <Dato etiqueta="Nombre" valor={usuario.nombre} />
            <Dato etiqueta="Apellido" valor={usuario.apellido} />
          </div>

          <div className="field-row">
            <Dato etiqueta="Username" valor={usuario.username} />
            <Dato etiqueta="Email" valor={usuario.email} />
          </div>

          <div className="field-row">
            <Dato
              etiqueta="Fecha de nacimiento"
              valor={usuario.fechaNacimiento ? formatFechaNacimiento(usuario.fechaNacimiento) : "—"}
            />
            <Dato etiqueta="Edad" valor={usuario.edad !== null ? `${usuario.edad} años` : "—"} />
          </div>

          <div className="field-row">
            <Dato etiqueta="Sexo" valor={usuario.sexo ? TEXTO_SEXO[usuario.sexo] : "—"} />
            <Dato etiqueta="Miembro desde" valor={formatDate(usuario.createdAt)} />
          </div>

          <p className="text-xs text-muted">
            Por ahora los datos del perfil no se pueden modificar desde la página.
          </p>
        </div>
      )}
    </CuentaLayout>
  );
}
