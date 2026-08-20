import { useState } from "react";

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "Danna Marcela Ramos",
      correo: "dr3105961@gmail.com",
      rol: "Estudiante",
      estado: "Activo",
    },
    {
      id: 2,
      nombre: "Juan Pérez",
      correo: "juanperez@ied.edu.co",
      rol: "Docente",
      estado: "Activo",
    },
    {
      id: 3,
      nombre: "Fernando Villa",
      correo: "coordinacion@ied.edu.co",
      rol: "Coordinador",
      estado: "Activo",
    },
    {
      id: 4,
      nombre: "María López",
      correo: "maria@ied.edu.co",
      rol: "Docente",
      estado: "Inactivo",
    },
    {
      id: 5,
      nombre: "Rosangel Olivares",
      correo: "rosangel@gmail.com",
      rol: "Estudiante",
      estado: "Activo",
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    rol: "Estudiante",
  });

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const cambiarEstado = (id) => {
    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              estado:
                usuario.estado === "Activo"
                  ? "Inactivo"
                  : "Activo",
            }
          : usuario
      )
    );
  };

  const agregarUsuario = () => {
    if (
      nuevoUsuario.nombre.trim() === "" ||
      nuevoUsuario.correo.trim() === ""
    ) {
      return;
    }

    const usuario = {
      id: usuarios.length + 1,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
      estado: "Activo",
    };

    setUsuarios([...usuarios, usuario]);

    setNuevoUsuario({
      nombre: "",
      correo: "",
      rol: "Estudiante",
    });

    setMostrarModal(false);
  };

  const eliminarUsuario = (id) => {
    setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
  };

  return (
    <div className="page-content">
      <div className="page-top">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios registrados en EduConnect BR.</p>
        </div>

        <button
          className="new-user-button"
          onClick={() => setMostrarModal(true)}
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="users-summary">
        <div className="user-summary-card">
          <span>Total usuarios</span>
          <strong>{usuarios.length}</strong>
        </div>

        <div className="user-summary-card">
          <span>Estudiantes</span>
          <strong>
            {usuarios.filter((u) => u.rol === "Estudiante").length}
          </strong>
        </div>

        <div className="user-summary-card">
          <span>Docentes</span>
          <strong>
            {usuarios.filter((u) => u.rol === "Docente").length}
          </strong>
        </div>

        <div className="user-summary-card">
          <span>Activos</span>
          <strong className="green-number">
            {usuarios.filter((u) => u.estado === "Activo").length}
          </strong>
        </div>
      </div>

      <div className="users-card">
        <div className="users-toolbar">
          <div>
            <h2>Usuarios registrados</h2>
            <p>Lista general de estudiantes y personal.</p>
          </div>

          <input
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {usuario.nombre.charAt(0)}
                      </div>

                      <strong>{usuario.nombre}</strong>
                    </div>
                  </td>

                  <td>{usuario.correo}</td>

                  <td>
                    <span className="role-badge">
                      {usuario.rol}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        usuario.estado === "Activo"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {usuario.estado}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        className="edit-user"
                        onClick={() => cambiarEstado(usuario.id)}
                      >
                        Cambiar
                      </button>

                      <button
                        className="delete-user"
                        onClick={() => eliminarUsuario(usuario.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div
          className="profile-modal-overlay"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="profile-modal-close"
              onClick={() => setMostrarModal(false)}
            >
              ×
            </button>

            <h2>Registrar usuario</h2>

            <p>Completa la información del nuevo usuario.</p>

            <div className="profile-form">
              <div className="profile-input-group">
                <label>Nombre completo</label>

                <input
                  type="text"
                  value={nuevoUsuario.nombre}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>

              <div className="profile-input-group">
                <label>Correo electrónico</label>

                <input
                  type="email"
                  value={nuevoUsuario.correo}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      correo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="profile-input-group">
                <label>Rol</label>

                <select
                  value={nuevoUsuario.rol}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      rol: e.target.value,
                    })
                  }
                >
                  <option>Estudiante</option>
                  <option>Docente</option>
                  <option>Coordinador</option>
                  <option>Administrador</option>
                </select>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button
                className="cancel-button"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>

              <button
                className="save-profile-button"
                onClick={agregarUsuario}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;