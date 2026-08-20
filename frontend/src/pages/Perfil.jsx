import { useState } from "react";

function Perfil() {
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [datos, setDatos] = useState({
    nombre: "Danna Marcela Ramos Martínez",
    documento: "1.000.000.000",
    grado: "10°",
    grupo: "A",
    correo: "dr3105961@gmail.com",
    telefono: "323 368 2183",
    ciudad: "Guamal, Magdalena",
  });

  const manejarCambio = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page-content">

      {/* ENCABEZADO */}

      <div className="page-top">

        <div>
          <h1>Mi Perfil</h1>

          <p>
            Consulta y administra tu información personal y académica.
          </p>
        </div>

        <div className="student-info">

          <div className="avatar">
            D
          </div>

          <div>
            <strong>Danna Ramos</strong>
            <small>Estudiante - 10°</small>
          </div>

        </div>

      </div>


      {/* PERFIL PRINCIPAL */}

      <div className="profile-layout">

        {/* COLUMNA IZQUIERDA */}

        <div className="profile-main">

          <div className="profile-header-card">

            <div className="profile-avatar-large">
              D
            </div>

            <div className="profile-header-info">

              <h2>
                {datos.nombre}
              </h2>

              <p>
                Estudiante de la I.E.D. Bienvenido Rodríguez
              </p>

              <div className="profile-tags">

                <span>
                  Estudiante
                </span>

                <span>
                  {datos.grado} - Grupo {datos.grupo}
                </span>

              </div>

            </div>

            <button
              className="profile-edit-button"
              onClick={() => setMostrarEditar(true)}
            >
              ✎ Editar perfil
            </button>

          </div>


          {/* INFORMACIÓN PERSONAL */}

          <div className="profile-card">

            <div className="profile-card-title">

              <div>
                <h2>Información personal</h2>

                <p>
                  Datos básicos del estudiante
                </p>
              </div>

              <div className="profile-title-icon">
                👤
              </div>

            </div>


            <div className="profile-information-grid">

              <div className="profile-field">

                <span>
                  Nombre completo
                </span>

                <strong>
                  {datos.nombre}
                </strong>

              </div>


              <div className="profile-field">

                <span>
                  Documento de identidad
                </span>

                <strong>
                  {datos.documento}
                </strong>

              </div>


              <div className="profile-field">

                <span>
                  Correo electrónico
                </span>

                <strong>
                  {datos.correo}
                </strong>

              </div>


              <div className="profile-field">

                <span>
                  Número de teléfono
                </span>

                <strong>
                  {datos.telefono}
                </strong>

              </div>


              <div className="profile-field">

                <span>
                  Municipio
                </span>

                <strong>
                  {datos.ciudad}
                </strong>

              </div>

            </div>

          </div>


          {/* INFORMACIÓN ACADÉMICA */}

          <div className="profile-card">

            <div className="profile-card-title">

              <div>
                <h2>Información académica</h2>

                <p>
                  Información relacionada con tu formación
                </p>
              </div>

              <div className="profile-title-icon academic">
                🎓
              </div>

            </div>


            <div className="academic-information-grid">

              <div className="academic-item">

                <span>
                  Institución educativa
                </span>

                <strong>
                  I.E.D. Bienvenido Rodríguez
                </strong>

              </div>


              <div className="academic-item">

                <span>
                  Grado
                </span>

                <strong>
                  {datos.grado}
                </strong>

              </div>


              <div className="academic-item">

                <span>
                  Grupo
                </span>

                <strong>
                  {datos.grupo}
                </strong>

              </div>


              <div className="academic-item">

                <span>
                  Año lectivo
                </span>

                <strong>
                  2026
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* COLUMNA DERECHA */}

        <div className="profile-sidebar">

          {/* ESTADO */}

          <div className="profile-side-card">

            <div className="profile-side-header">

              <h3>
                Estado de cuenta
              </h3>

              <span className="account-active">
                Activa
              </span>

            </div>

            <div className="account-status">

              <div className="status-check">
                ✓
              </div>

              <div>
                <strong>
                  Cuenta activa
                </strong>

                <p>
                  Tu cuenta se encuentra habilitada.
                </p>
              </div>

            </div>

          </div>


          {/* SEGURIDAD */}

          <div className="profile-side-card">

            <div className="profile-side-header">

              <h3>
                Seguridad
              </h3>

              <span className="security-icon">
                🔒
              </span>

            </div>

            <p className="security-text">
              Protege tu cuenta manteniendo actualizada
              tu contraseña.
            </p>

            <button
              className="password-button"
              onClick={() => setMostrarPassword(true)}
            >
              Cambiar contraseña
            </button>

          </div>


          {/* INFORMACIÓN */}

          <div className="profile-side-card profile-help">

            <div className="help-icon">
              ?
            </div>

            <h3>
              ¿Necesitas ayuda?
            </h3>

            <p>
              Si encuentras algún error en tus datos,
              comunícate con coordinación académica.
            </p>

          </div>

        </div>

      </div>


      {/* MODAL EDITAR PERFIL */}

      {mostrarEditar && (

        <div
          className="profile-modal-overlay"
          onClick={() => setMostrarEditar(false)}
        >

          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="profile-modal-close"
              onClick={() => setMostrarEditar(false)}
            >
              ×
            </button>

            <h2>
              Editar perfil
            </h2>

            <p>
              Actualiza la información que deseas modificar.
            </p>


            <div className="profile-form">

              <div className="profile-input-group">

                <label>
                  Nombre completo
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={datos.nombre}
                  onChange={manejarCambio}
                />

              </div>


              <div className="profile-input-group">

                <label>
                  Correo electrónico
                </label>

                <input
                  type="email"
                  name="correo"
                  value={datos.correo}
                  onChange={manejarCambio}
                />

              </div>


              <div className="profile-input-group">

                <label>
                  Número de teléfono
                </label>

                <input
                  type="text"
                  name="telefono"
                  value={datos.telefono}
                  onChange={manejarCambio}
                />

              </div>


              <div className="profile-input-group">

                <label>
                  Municipio
                </label>

                <input
                  type="text"
                  name="ciudad"
                  value={datos.ciudad}
                  onChange={manejarCambio}
                />

              </div>

            </div>


            <div className="profile-modal-actions">

              <button
                className="cancel-button"
                onClick={() => setMostrarEditar(false)}
              >
                Cancelar
              </button>

              <button
                className="save-profile-button"
                onClick={() => setMostrarEditar(false)}
              >
                Guardar cambios
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MODAL CONTRASEÑA */}

      {mostrarPassword && (

        <div
          className="profile-modal-overlay"
          onClick={() => setMostrarPassword(false)}
        >

          <div
            className="profile-modal password-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="profile-modal-close"
              onClick={() => setMostrarPassword(false)}
            >
              ×
            </button>

            <div className="password-modal-icon">
              🔒
            </div>

            <h2>
              Cambiar contraseña
            </h2>

            <p>
              Introduce una nueva contraseña para proteger
              tu cuenta.
            </p>


            <div className="profile-form">

              <div className="profile-input-group">

                <label>
                  Contraseña actual
                </label>

                <input
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                />

              </div>


              <div className="profile-input-group">

                <label>
                  Nueva contraseña
                </label>

                <input
                  type="password"
                  placeholder="Ingresa una nueva contraseña"
                />

              </div>


              <div className="profile-input-group">

                <label>
                  Confirmar contraseña
                </label>

                <input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                />

              </div>

            </div>


            <div className="profile-modal-actions">

              <button
                className="cancel-button"
                onClick={() => setMostrarPassword(false)}
              >
                Cancelar
              </button>

              <button
                className="save-profile-button"
                onClick={() => setMostrarPassword(false)}
              >
                Actualizar contraseña
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Perfil;