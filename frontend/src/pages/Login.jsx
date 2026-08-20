import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = (e) => {
    e.preventDefault();

    if (!usuario || !contrasena) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    // Login de demostración
    if (usuario === "admin" && contrasena === "123456") {
      localStorage.setItem("usuarioEduConnect", usuario);
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="login-page">

      <div className="login-background-decoration decoration-one"></div>
      <div className="login-background-decoration decoration-two"></div>

      <div className="login-card">

        <div className="logo-container">
          <div className="edu-logo">
            <div className="book-left">📖</div>
            <div className="wifi-symbol">⌁</div>
          </div>

          <h1>
            Edu<span>Connect</span> BR
          </h1>

          <p>Conectando la educación, acercando el futuro</p>
        </div>

        <div className="login-title">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={iniciarSesion}>

          <div className="input-group">
            <label>Usuario</label>

            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>

            <div className="password-container">
              <input
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setMostrarContrasena(!mostrarContrasena)
                }
              >
                {mostrarContrasena ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button className="login-button" type="submit">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-footer">
          <span>¿No tienes una cuenta?</span>
          <a href="#">Contacta a la institución</a>
        </div>

        <div className="demo-login">
          <strong>Demo:</strong>
          <br />
          Usuario: admin
          <br />
          Contraseña: 123456
        </div>

      </div>
    </div>
  );
}

export default Login;