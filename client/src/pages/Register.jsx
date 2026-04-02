import { useState } from "react";
import { register, saveUser } from "../services/auth";
import { useNavigate } from "react-router-dom";


function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleRegister = async () => {
  setError("");

  if (!firstName || !lastName || !phone || !password) {
    setError("Заполните все поля");
    return;
  }

  if (password.length < 6) {
    setError("Пароль должен содержать минимум 6 символов");
    return;
  }

  try {
    const data = await register(firstName, lastName, phone, password);
    if (!data.user) {
      setError(data.message || "Ошибка регистрации");
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
        <h2>Регистрация</h2>

        <input
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль (минимум 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleRegister}>
          Зарегистрироваться
        </button>

        <p className="switch">
          Уже есть аккаунт?{" "}
          <span onClick={() => navigate("/login")}>
            Войти
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;