import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GestionUsuarios from "./pages/GestionUsuarios";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MisNotas from "./pages/MisNotas";
import Asistencia from "./pages/Asistencia";
import Comunicados from "./pages/Comunicados";
import Perfil from "./pages/Perfil";
import Mensajes from "./pages/Mensajes";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
  path="/mis-notas"
  element={<MisNotas />}
/>
<Route
  path="/asistencia"
  element={<Asistencia />}
/>

<Route
  path="/comunicados"
  element={<Comunicados />}
/><Route
  path="/perfil"
  element={<Perfil />}
/><Route path="/mensajes" element={<Mensajes />} />

<Route path="/gestion-usuarios" element={<GestionUsuarios />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;