import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioEduConnect");
    navigate("/login");
  };

  return (
    <div className="dashboard">

      {/* MENÚ LATERAL */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="mini-logo">📖</div>

          <div>
            <h2>
              Edu<span>Connect</span> BR
            </h2>
            <small>I.E.D. Bienvenido Rodríguez</small>
          </div>
        </div>

        <nav className="sidebar-menu">

          <a className="menu-item active">
            <span>⌂</span>
            Inicio
          </a>

         <Link to="/perfil" className="menu-item">
  <span>👤</span>
  Perfil
</Link>

         <Link to="/mis-notas" className="menu-item">
  <span>▣</span>
  Mis Notas
</Link>

          <Link to="/asistencia" className="menu-item">
  <span>✓</span>
  Asistencia
</Link>

          <a className="menu-item">
            <span>☑</span>
            Tareas
          </a>

          <Link to="/comunicados" className="menu-item">
  <span>📢</span>
  Comunicados
</Link>

          <a className="menu-item">
            <span>▦</span>
            Calendario
          </a>

          <Link to="/mensajes" className="menu-item">
  <span>✉</span>
  Mensajes
</Link>

<Link to="/gestion-usuarios" className="menu-item">
  <span>👥</span>
  Gestión Usuarios
</Link>

        </nav>

        <button
          className="logout-button"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>


      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">

        {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <h1>¡Hola, Danna Ramos! 👋</h1>
            <p>Bienvenida a tu panel académico</p>
          </div>

          <div className="header-right">

            <button className="notification-button">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="profile-mini">
              <div className="avatar">
                D
              </div>

              <div>
                <strong>Danna Ramos</strong>
                <small>Estudiante</small>
              </div>
            </div>

          </div>

        </header>


        {/* TARJETAS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              ★
            </div>

            <div>
              <span>Promedio General</span>
              <strong>4.3</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ▣
            </div>

            <div>
              <span>Asignaturas</span>
              <strong>8</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              !
            </div>

            <div>
              <span>Tareas Pendientes</span>
              <strong>2</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon cyan">
              ✓
            </div>

            <div>
              <span>Asistencia</span>
              <strong>92%</strong>
            </div>
          </div>

        </section>


        {/* CONTENIDO INFERIOR */}
        <section className="dashboard-grid">

          {/* ACTIVIDADES */}
          <div className="dashboard-card">

            <div className="card-header">
              <h2>Próximas Actividades</h2>
              <a href="#">Ver calendario</a>
            </div>

            <div className="activity-list">

              <div className="activity">
                <div className="activity-icon green-icon">
                  ✓
                </div>

                <div>
                  <strong>Entrega de tarea de Matemáticas</strong>
                  <span>15 Mayo, 2026</span>
                </div>
              </div>

              <div className="activity">
                <div className="activity-icon blue-icon">
                  ✓
                </div>

                <div>
                  <strong>Evaluación de Ciencias Naturales</strong>
                  <span>20 Mayo, 2026</span>
                </div>
              </div>

              <div className="activity">
                <div className="activity-icon red-icon">
                  !
                </div>

                <div>
                  <strong>Reunión de Padres de Familia</strong>
                  <span>25 Mayo, 2026</span>
                </div>
              </div>

            </div>

          </div>


          {/* COMUNICADOS */}
          <div className="dashboard-card">

            <div className="card-header">
              <h2>Comunicados Recientes</h2>
              <a href="#">Ver todos</a>
            </div>

            <div className="announcement-list">

              <div className="announcement">
                <div className="announcement-icon blue-icon">
                  📢
                </div>

                <div>
                  <strong>Suspensión de clases</strong>
                  <span>Por: Coordinación</span>
                </div>

                <small>12 Mayo, 2026</small>
              </div>

              <div className="announcement">
                <div className="announcement-icon green-icon">
                  📢
                </div>

                <div>
                  <strong>Feria de la Ciencia 2026</strong>
                  <span>Por: Rectoría</span>
                </div>

                <small>10 Mayo, 2026</small>
              </div>

              <div className="announcement">
                <div className="announcement-icon green-icon">
                  📄
                </div>

                <div>
                  <strong>Entrega de informe académico</strong>
                  <span>Por: Coordinación</span>
                </div>

                <small>8 Mayo, 2026</small>
              </div>

            </div>

          </div>

        </section>


        {/* MENSAJE */}
        <div className="welcome-banner">

          <div>
            <h2>Todo en un solo lugar</h2>

            <p>
              Consulta tus notas, asistencia, tareas y comunicados
              de la institución de manera rápida y organizada.
            </p>
          </div>

          <div className="banner-icon">
            🎓
          </div>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;