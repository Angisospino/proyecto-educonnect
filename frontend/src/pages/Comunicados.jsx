import { useState } from "react";
import "./Comunicados.css";

function Comunicados() {
  const [categoria, setCategoria] = useState("Todos");
  const [comunicadoSeleccionado, setComunicadoSeleccionado] = useState(null);

  const comunicados = [
    {
      id: 1,
      titulo: "Reunión de padres de familia",
      descripcion:
        "Se informa a los padres de familia que se realizará una reunión para tratar temas relacionados con el rendimiento académico y las actividades institucionales.",
      categoria: "Académico",
      fecha: "15 de mayo de 2026",
      autor: "Coordinación Académica",
      prioridad: "Importante",
      hora: "8:00 AM",
    },
    {
      id: 2,
      titulo: "Jornada deportiva institucional",
      descripcion:
        "La institución educativa realizará una jornada deportiva con la participación de los estudiantes de todos los grados. Se recomienda asistir con ropa deportiva.",
      categoria: "Eventos",
      fecha: "13 de mayo de 2026",
      autor: "Área de Educación Física",
      prioridad: "Normal",
      hora: "10:30 AM",
    },
    {
      id: 3,
      titulo: "Entrega de informes académicos",
      descripcion:
        "Se informa que próximamente se realizará la entrega de informes académicos correspondientes al primer periodo del año 2026.",
      categoria: "Académico",
      fecha: "10 de mayo de 2026",
      autor: "Rectoría",
      prioridad: "Importante",
      hora: "9:15 AM",
    },
    {
      id: 4,
      titulo: "Actualización de horarios",
      descripcion:
        "Se informa a toda la comunidad educativa que se realizaron algunos cambios en los horarios de clase. Los estudiantes deben consultar la nueva programación.",
      categoria: "Institucional",
      fecha: "8 de mayo de 2026",
      autor: "Coordinación",
      prioridad: "Normal",
      hora: "7:45 AM",
    },
    {
      id: 5,
      titulo: "Actividad cultural de la institución",
      descripcion:
        "La institución invita a los estudiantes a participar en las actividades culturales programadas para este mes.",
      categoria: "Eventos",
      fecha: "5 de mayo de 2026",
      autor: "Área Cultural",
      prioridad: "Normal",
      hora: "11:00 AM",
    },
    {
      id: 6,
      titulo: "Información importante para estudiantes",
      descripcion:
        "Se recuerda a los estudiantes la importancia de cumplir con los horarios, portar correctamente el uniforme y mantener una convivencia respetuosa.",
      categoria: "Institucional",
      fecha: "2 de mayo de 2026",
      autor: "Rectoría",
      prioridad: "Importante",
      hora: "8:30 AM",
    },
  ];

  const comunicadosFiltrados =
    categoria === "Todos"
      ? comunicados
      : comunicados.filter(
          (comunicado) => comunicado.categoria === categoria
        );

  const obtenerClaseCategoria = (categoria) => {
    if (categoria === "Académico") return "category-academic";
    if (categoria === "Eventos") return "category-event";
    return "category-institutional";
  };

  const obtenerClasePrioridad = (prioridad) => {
    if (prioridad === "Importante") {
      return "priority-important";
    }

    return "priority-normal";
  };

  return (
    <div className="page-content comunicados-page">

      {/* ENCABEZADO */}

      <div className="page-top">

        <div>
          <h1>Comunicados</h1>

          <p>
            Consulta las noticias y comunicados de la institución.
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


      {/* FILTROS */}

      <div className="communications-toolbar">

        <div className="filter-group">

          <label>Filtrar por categoría</label>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option>Todos</option>
            <option>Académico</option>
            <option>Institucional</option>
            <option>Eventos</option>
          </select>

        </div>

        <div className="communications-count">
          <strong>{comunicadosFiltrados.length}</strong>
          <span>comunicados publicados</span>
        </div>

      </div>


      {/* CONTENIDO */}

      <div className="communications-layout">

        <div className="communications-list">

          {comunicadosFiltrados.map((comunicado) => (

            <div
              className="communication-card"
              key={comunicado.id}
            >

              {/* PARTE SUPERIOR */}

              <div className="communication-card-top">

                <div
                  className={`communication-icon ${obtenerClaseCategoria(
                    comunicado.categoria
                  )}`}
                >
                  {comunicado.categoria === "Académico" && "A"}

                  {comunicado.categoria === "Eventos" && "E"}

                  {comunicado.categoria === "Institucional" && "I"}
                </div>

                <div className="communication-title">

                  <div className="communication-badges">

                    <span
                      className={`communication-category ${obtenerClaseCategoria(
                        comunicado.categoria
                      )}`}
                    >
                      {comunicado.categoria}
                    </span>

                    <span
                      className={`communication-priority ${obtenerClasePrioridad(
                        comunicado.prioridad
                      )}`}
                    >
                      {comunicado.prioridad}
                    </span>

                  </div>

                  <h2>
                    {comunicado.titulo}
                  </h2>

                </div>

              </div>


              {/* DESCRIPCIÓN */}

              <p className="communication-description">
                {comunicado.descripcion}
              </p>


              {/* INFORMACIÓN */}

              <div className="communication-info">

                <span>
                  📅 {comunicado.fecha}
                </span>

                <span>
                  👤 {comunicado.autor}
                </span>

                <span>
                  🕐 {comunicado.hora}
                </span>

              </div>


              {/* BOTÓN */}

              <button
                className="read-communication"
                onClick={() =>
                  setComunicadoSeleccionado(comunicado)
                }
              >
                Leer comunicado →
              </button>

            </div>

          ))}

        </div>


        {/* PANEL LATERAL */}

        <div className="communications-side">

          <div className="communications-side-card">

            <div className="side-card-icon">
              📢
            </div>

            <h2>
              Mantente informado
            </h2>

            <p>
              Revisa periódicamente los comunicados para
              conocer las novedades, actividades y
              anuncios importantes de la institución.
            </p>

          </div>


          <div className="communications-side-card">

            <h3>
              Categorías
            </h3>

            <div className="category-list">

              <button
                onClick={() => setCategoria("Todos")}
                className={categoria === "Todos" ? "active" : ""}
              >
                <span className="category-dot all-dot"></span>
                Todos
              </button>

              <button
                onClick={() => setCategoria("Académico")}
                className={categoria === "Académico" ? "active" : ""}
              >
                <span className="category-dot academic-dot"></span>
                Académico
              </button>

              <button
                onClick={() => setCategoria("Institucional")}
                className={categoria === "Institucional" ? "active" : ""}
              >
                <span className="category-dot institutional-dot"></span>
                Institucional
              </button>

              <button
                onClick={() => setCategoria("Eventos")}
                className={categoria === "Eventos" ? "active" : ""}
              >
                <span className="category-dot event-dot"></span>
                Eventos
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* MODAL */}

      {comunicadoSeleccionado && (

        <div
          className="communication-modal-overlay"
          onClick={() => setComunicadoSeleccionado(null)}
        >

          <div
            className="communication-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setComunicadoSeleccionado(null)}
            >
              ×
            </button>

            <div
              className={`modal-icon ${obtenerClaseCategoria(
                comunicadoSeleccionado.categoria
              )}`}
            >
              📢
            </div>

            <span
              className={`communication-category ${obtenerClaseCategoria(
                comunicadoSeleccionado.categoria
              )}`}
            >
              {comunicadoSeleccionado.categoria}
            </span>

            <h2>
              {comunicadoSeleccionado.titulo}
            </h2>

            <div className="modal-meta">

              <span>
                📅 {comunicadoSeleccionado.fecha}
              </span>

              <span>
                👤 {comunicadoSeleccionado.autor}
              </span>

            </div>

            <div className="modal-content">

              <p>
                {comunicadoSeleccionado.descripcion}
              </p>

              <p>
                Para mayor información, los estudiantes y
                padres de familia pueden comunicarse con la
                dependencia correspondiente de la institución.
              </p>

            </div>

            <button
              className="modal-button"
              onClick={() => setComunicadoSeleccionado(null)}
            >
              Cerrar
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Comunicados;