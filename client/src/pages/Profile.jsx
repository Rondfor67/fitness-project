import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/auth";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { API } from "../api";

function Profile() {
  const navigate = useNavigate();
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } 
  }, []);

  const fetchBookings = async () => {
    const res = await fetch(`${API}/api/my-bookings/${user.id}`);
    const data = await res.json();
    setBookings(data);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <>
    
      <NavBar title="" />

      <div className="container">

        {message && <div className="message">{message}</div>}

        <div className="profile-card">

          <div className="profile-left">
            <h2 className="profile-title">Личный кабинет</h2>

            <div className="profile-info">
              <p className="label">Имя</p>
              <p className="value">{user.firstName}</p>

              <p className="label">Фамилия</p>
              <p className="value">{user.lastName}</p>

              <p className="label">Телефон</p>
              <p className="value">{user.phone}</p>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Выйти
            </button>
          </div>

          <div className="profile-right">

            <div
  className="big-btn"
  onClick={() => {
    if (!user) {
      setMessage("Вы не вошли в аккаунт");
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      setMessage("Данная функция доступна только пользователям");
      return;
    }

    navigate("/my-bookings")
  }}
>
  Мои записи
</div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Profile;