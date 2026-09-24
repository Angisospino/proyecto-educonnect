import { useState } from "react";
import "./MisNotas.css";

function MisNotas() {
  const [periodo, setPeriodo] = useState("1 Periodo - 2026");
  const [grado, setGrado] = useState("10°");

  const notas = [
    {
      asignatura: "Matemáticas",
      docente: "Juan Pérez",
      nota1: 4.2,
      nota2: 4.5,
      nota3: 4.6,
      promedio: 4.4,
    },
    {
      asignatura: "Lengua Castellana",
      docente: "María López",
      nota1: 4.0,
      nota2: 4.3,
      nota3: 4.5,
      promedio: 4.3,
    },
    {
      asignatura: "Inglés",
      docente: "Laura Gómez",
      nota1: 4.5,
      nota2: 4.6,
      nota3: 4.7,
      promedio: 4.6,
    },
    {
      asignatura: "Ciencias Naturales",
      docente: "Carlos Ruiz",
      nota1: 4.1,
      nota2: 4.3,
      nota3: 4.4,
      promedio: 4.3,
    },
    {
      asignatura: "Sociales",
      docente: "Ana Torres",
      nota1: 4.3,
      nota2: 4.4,
      nota3: 4.5,
      promedio: 4.4,
    },
    {
      asignatura: "Educación Física",
      docente: "Pedro Martínez",
      nota1: 4.6,
      nota2: 4.7,
      nota3: 4.8,
      promedio: 4.7,
    },
    {
      asignatura: "Informática",
      docente: "Oscar Pérez",
      nota1: 4.5,
      nota2: 4.7,
      nota3: 4.9,
      promedio: 4.7,
    },
    {
      asignatura: "Artística",
      docente: "Claudia Díaz",
      nota1: 4.7,
      nota2: 4.8,
      nota3: 4.9,
      promedio: 4.8,
    },
  ];

  const promedioGeneral = (
    notas.reduce((total, nota) => total + nota.promedio, 0) /
    notas.length
  ).toFixed(1);

  const obtenerClaseNota = (nota) => {
    if (nota >= 4.5) return "nota-excelente";
    if (nota >= 3.5) return "nota-buena";
    return "nota-baja";
  };

  return (
    <div className="page-content mis-notas-page">

      {/* ENCABEZADO */}
      <div className="page-top">

        <div>
          <h1>Mis Notas</h1>
          <p>
            Consulta tu rendimiento académico por periodo.
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
      <div className="notes-filters">

        <div className="filter-group">
          <label>Periodo</label>

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


        <div className="filter-group">
          <label>Grado</label>

          <select
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
          >
            <option>10°</option>
            <option>11°</option>
            <option>9°</option>
            <option>8°</option>
          </select>
        </div>

      </div>


      {/* RESUMEN */}
      <div className="notes-summary">

        <div className="average-card">

          <div className="average-icon">
            ★
          </div>

          <div>
            <span>Promedio General</span>
            <strong>{promedioGeneral}</strong>
            <small>Escala de valoración: 1.0 a 5.0</small>
          </div>

        </div>


        <div className="summary-item">
          <span>Asignaturas</span>
          <strong>{notas.length}</strong>
        </div>


        <div className="summary-item">
          <span>Asignaturas aprobadas</span>
          <strong className="approved">
            {notas.filter((nota) => nota.promedio >= 3.0).length}
          </strong>
        </div>


        <div className="summary-item">
          <span>Mejor promedio</span>
          <strong className="best-grade">
            {Math.max(...notas.map((nota) => nota.promedio)).toFixed(1)}
          </strong>
        </div>

      </div>


      {/* TABLA */}
      <div className="notes-card">

        <div className="notes-card-header">

          <div>
            <h2>Calificaciones académicas</h2>

            <p>
              {periodo} · Grado {grado}
            </p>
          </div>

          <button className="download-button">
            ↓ Descargar
          </button>

        </div>


        <div className="table-container">

          <table className="grades-table">

            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Nota 1</th>
                <th>Nota 2</th>
                <th>Nota 3</th>
                <th>Promedio</th>
              </tr>
            </thead>

            <tbody>

              {notas.map((nota, index) => (

                <tr key={index}>

                  <td>
                    <div className="subject-cell">

                      <div className="subject-icon">
                        {nota.asignatura.charAt(0)}
                      </div>

                      <strong>{nota.asignatura}</strong>

                    </div>
                  </td>

                  <td className="teacher">
                    {nota.docente}
                  </td>

                  <td>
                    <span className={`grade ${obtenerClaseNota(nota.nota1)}`}>
                      {nota.nota1.toFixed(1)}
                    </span>
                  </td>

                  <td>
                    <span className={`grade ${obtenerClaseNota(nota.nota2)}`}>
                      {nota.nota2.toFixed(1)}
                    </span>
                  </td>

                  <td>
                    <span className={`grade ${obtenerClaseNota(nota.nota3)}`}>
                      {nota.nota3.toFixed(1)}
                    </span>
                  </td>

                  <td>
                    <span className="average-grade">
                      {nota.promedio.toFixed(1)}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="table-footer">
          <span>
            Mostrando {notas.length} asignaturas
          </span>

          <span>
            Escala de valoración: <strong>1.0 - 5.0</strong>
          </span>
        </div>

      </div>

    </div>
  );
}

export default MisNotas;