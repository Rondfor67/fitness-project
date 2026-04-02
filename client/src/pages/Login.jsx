import { useState } from "react";
import { login, saveUser } from "../services/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!phone || !password) {
      setError("Заполните все поля");
      return;
    }

    try {
      const data = await login(phone, password);

    if (!data.user) {
      setError(data.message);
      return;
    }

    saveUser(data); 
    navigate("/profile");

    } catch (err) {
      setError("Ошибка сервера");
      console.log(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Вход</h2>

        <input
          type="text"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin}>
          Войти
        </button>

        <p className="switch">
          Нет аккаунта?{" "}
          <span onClick={() => navigate("/register")}>
            Зарегистрироваться
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;