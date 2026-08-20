import { useState } from "react";

function Mensajes() {
  const contactos = [
    {
      id: 1,
      nombre: "Coordinación Académica",
      inicial: "C",
      ultimo: "Buenos días, recuerda la reunión...",
      hora: "10:30 AM",
      activo: true,
    },
    {
      id: 2,
      nombre: "Prof. Juan Pérez",
      inicial: "J",
      ultimo: "La tarea estará disponible hoy.",
      hora: "9:15 AM",
      activo: false,
    },
    {
      id: 3,
      nombre: "María López",
      inicial: "M",
      ultimo: "Excelente trabajo en clase.",
      hora: "Ayer",
      activo: false,
    },
    {
      id: 4,
      nombre: "Rectoría",
      inicial: "R",
      ultimo: "Se publicó un nuevo comunicado.",
      hora: "Ayer",
      activo: false,
    },
  ];

  const [contactoSeleccionado, setContactoSeleccionado] = useState(contactos[0]);

  const [mensaje, setMensaje] = useState("");

  const [conversaciones, setConversaciones] = useState({
    1: [
      {
        autor: "Coordinación",
        texto: "Buenos días Danna. Te recordamos que la reunión de padres será el viernes.",
        hora: "9:40 AM",
      },
      {
        autor: "yo",
        texto: "Muchas gracias por la información.",
        hora: "9:45 AM",
      },
    ],
    2: [
      {
        autor: "Juan Pérez",
        texto: "La tarea de matemáticas estará disponible hoy en la plataforma.",
        hora: "8:20 AM",
      },
    ],
    3: [
      {
        autor: "María López",
        texto: "Excelente participación durante la clase de hoy.",
        hora: "Ayer",
      },
    ],
    4: [
      {
        autor: "Rectoría",
        texto: "Se publicó un nuevo comunicado institucional.",
        hora: "Ayer",
      },
    ],
  });

  const enviarMensaje = () => {
    if (mensaje.trim() === "") return;

    const nuevoMensaje = {
      autor: "yo",
      texto: mensaje,
      hora: "Ahora",
    };

    setConversaciones({
      ...conversaciones,
      [contactoSeleccionado.id]: [
        ...conversaciones[contactoSeleccionado.id],
        nuevoMensaje,
      ],
    });

    setMensaje("");
  };

  return (
    <div className="page-content">
      <div className="page-top">
        <div>
          <h1>Mensajes</h1>
          <p>Comunícate con docentes y personal de la institución.</p>
        </div>

        <div className="student-info">
          <div className="avatar">D</div>

          <div>
            <strong>Danna Ramos</strong>
            <small>Estudiante - 10°</small>
          </div>
        </div>
      </div>

      <div className="messages-container">
        <div className="contacts-panel">
          <div className="contacts-header">
            <h2>Conversaciones</h2>

            <input type="text" placeholder="Buscar..." />
          </div>

          <div className="contacts-list">
            {contactos.map((contacto) => (
              <div
                key={contacto.id}
                className={`contact-item ${
                  contactoSeleccionado.id === contacto.id ? "selected" : ""
                }`}
                onClick={() => setContactoSeleccionado(contacto)}
              >
                <div className="contact-avatar">{contacto.inicial}</div>

                <div className="contact-info">
                  <strong>{contacto.nombre}</strong>
                  <span>{contacto.ultimo}</span>
                </div>

                <small>{contacto.hora}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-user">
              <div className="contact-avatar">
                {contactoSeleccionado.inicial}
              </div>

              <div>
                <h2>{contactoSeleccionado.nombre}</h2>
                <span>En línea</span>
              </div>
            </div>

            <button className="chat-info">⋮</button>
          </div>

          <div className="chat-body">
            {conversaciones[contactoSeleccionado.id].map(
              (item, index) => (
                <div
                  key={index}
                  className={`message-bubble ${
                    item.autor === "yo" ? "my-message" : "received-message"
                  }`}
                >
                  <p>{item.texto}</p>
                  <small>{item.hora}</small>
                </div>
              )
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") enviarMensaje();
              }}
            />

            <button onClick={enviarMensaje}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mensajes;