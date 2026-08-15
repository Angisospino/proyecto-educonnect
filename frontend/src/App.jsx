import { useEffect, useState } from "react";

function App() {
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000")
            .then((respuesta) => respuesta.json())
            .then((datos) => setMensaje(datos.mensaje))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div>
            <h1>EduConnect BR</h1>
            <p>{mensaje}</p>
        </div>
    );
}

export default App;