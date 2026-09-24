import { useState } from "react";
import "./Asistencia.css";

function Asistencia() {
  const [periodo, setPeriodo] = useState("1 Periodo - 2026");

  const registros = [
    {
      fecha: "12/05/2026",
      dia: "Martes",
      asignatura: "Matemáticas",
      hora: "7:00 AM",
      estado: "Presente",
    },
    {
      fecha: "12/05/2026",
      dia: "Martes",
      asignatura: "Lengua Castellana",
      hora: "8:00 AM",
      estado: "Presente",
    },
    {
      fecha: "11/05/2026",
      dia: "Lunes",
      asignatura: "Ciencias Naturales",
      hora: "7:00 AM",
      estado: "Presente",
    },
    {
      fecha: "11/05/2026",
      dia: "Lunes",
      asignatura: "Inglés",
      hora: "9:00 AM",
      estado: "Retardo",
    },
    {
      fecha: "08/05/2026",
      dia: "Viernes",
      asignatura: "Sociales",
      hora: "7:00 AM",
      estado: "Presente",
    },
    {
      fecha: "08/05/2026",
      dia: "Viernes",
      asignatura: "Informática",
      hora: "10:00 AM",
      estado: "Ausente",
    },
    {
      fecha: "07/05/2026",
      dia: "Jueves",
      asignatura: "Educación Física",
      hora: "8:00 AM",
      estado: "Presente",
    },
    {
      fecha: "06/05/2026",
      dia: "Miércoles",
      asignatura: "Artística",
      hora: "9:00 AM",
      estado: "Presente",
    },
  ];

  const presentes = registros.filter(
    (registro) => registro.estado === "Presente"
  ).length;

  const ausencias = registros.filter(
    (registro) => registro.estado === "Ausente"
  ).length;

  const retardos = registros.filter(
    (registro) => registro.estado === "Retardo"
  ).length;

  const total = registros.length;

  const porcentaje = Math.round((presentes / total) * 100);

  const obtenerClaseEstado = (estado) => {
    if (estado === "Presente") return "status-present";
    if (estado === "Ausente") return "status-absent";
    return "status-late";
  };

  return (
    <div className="page-content asistencia-page">

      {/* ENCABEZADO */}

      <div className="page-top">

        <div>
          <h1>Mi Asistencia</h1>

          <p>
            Consulta tu registro de asistencia y puntualidad.
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


      {/* FILTRO */}

      <div className="attendance-filter">

        <div className="filter-group">

          <label>Periodo académico</label>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option>1 Periodo - 2026</option>
            <option>2 Periodo - 2026</option>
            <option>3 Periodo - 2026</option>
            <option>4 Periodo - 2026</option>
          </select>

        </div>

      </div>


      {/* RESUMEN DE ASISTENCIA */}

      <div className="attendance-summary">

        {/* PORCENTAJE */}

        <div className="attendance-main-card">

          <div className="attendance-circle">

            <div>
              <strong>{porcentaje}%</strong>
              <span>Asistencia</span>
            </div>

          </div>

          <div className="attendance-main-info">

            <h2>Excelente asistencia</h2>

            <p>
              Tu porcentaje de asistencia durante este periodo
              es del {porcentaje}%.
            </p>

            <div className="attendance-progress">

              <div
                className="attendance-progress-bar"
                style={{ width: `${porcentaje}%` }}
              ></div>

            </div>

          </div>

        </div>


        {/* PRESENTES */}

        <div className="attendance-stat">

          <div className="attendance-stat-icon present-icon">
            ✓
          </div>

          <div>
            <span>Presentes</span>
            <strong>{presentes}</strong>
          </div>

        </div>


        {/* AUSENCIAS */}

        <div className="attendance-stat">

          <div className="attendance-stat-icon absent-icon">
            !
          </div>

          <div>
            <span>Ausencias</span>
            <strong>{ausencias}</strong>
          </div>

        </div>


        {/* RETARDOS */}

        <div className="attendance-stat">

          <div className="attendance-stat-icon late-icon">
            ◷
          </div>

          <div>
            <span>Retardos</span>
            <strong>{retardos}</strong>
          </div>

        </div>

      </div>


      {/* REGISTRO */}

      <div className="attendance-card">

        <div className="attendance-card-header">

          <div>

            <h2>Registro de asistencia</h2>

            <p>
              {periodo}
            </p>

          </div>

          <button className="download-button">
            ↓ Descargar
          </button>

        </div>


        {/* TABLA */}

        <div className="table-container">

          <table className="attendance-table">

            <thead>

              <tr>
                <th>Fecha</th>
                <th>Día</th>
                <th>Asignatura</th>
                <th>Hora</th>
                <th>Estado</th>
              </tr>

            </thead>

            <tbody>

              {registros.map((registro, index) => (

                <tr key={index}>

                  <td>
                    {registro.fecha}
                  </td>

                  <td className="attendance-day">
                    {registro.dia}
                  </td>

                  <td>
                    <div className="attendance-subject">

                      <div className="attendance-subject-icon">
                        {registro.asignatura.charAt(0)}
                      </div>

                      <strong>
                        {registro.asignatura}
                      </strong>

                    </div>
                  </td>

                  <td className="attendance-time">
                    {registro.hora}
                  </td>

                  <td>

                    <span
                      className={`attendance-status ${obtenerClaseEstado(
                        registro.estado
                      )}`}
                    >

                      {registro.estado === "Presente" && "✓"}

                      {registro.estado === "Ausente" && "!"}

                      {registro.estado === "Retardo" && "◷"}

                      <span>
                        {registro.estado}
                      </span>

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* PIE */}

        <div className="attendance-footer">

          <span>
            Mostrando {registros.length} registros
          </span>

          <span>
            Periodo: <strong>{periodo}</strong>
          </span>

        </div>

      </div>


      {/* INFORMACIÓN */}

      <div className="attendance-info-box">

        <div className="info-box-icon">
          i
        </div>

        <div>

          <strong>
            Información sobre tu asistencia
          </strong>

          <p>
            Recuerda que mantener una buena asistencia es
            importante para tu proceso académico. Si encuentras
            algún registro incorrecto, comunícate con el docente
            correspondiente o con coordinación.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Asistencia;