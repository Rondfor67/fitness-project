import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/auth";
import NavBar from "../components/NavBar";
import { API } from "../api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const user = getUser();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  useEffect(() => {
    if (!message) return;
  
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
  
    return () => clearTimeout(timer);
    }, [message]);

    if (user.role === "admin") {
      setMessage("Данная функция доступна только пользователям");
      navigate("/profile");
      return;
    }

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await fetch(`${API}/api/my-bookings/${user.id}`);
    const data = await res.json();
    setBookings(data);
  };

return (
  <>
    <NavBar title="" />
    <h1 className="text">Мои записи</h1>
    <div className="container">

      {message && <div className="message">{message}</div>}

      <div className="cards">
        {bookings.length === 0 ? (
          <p className="no-bookings">У вас пока нет записей</p>
        ) : (
          bookings.map((b) => {
            const trainingDate = new Date(`${b.date} ${b.time}`);
            const now = new Date();
            const diff = (trainingDate - now) / (1000 * 60 * 60);

            return (
              <div key={b._id} className="card">

                <img
                  src={b.image || "/images/default.webp"}
                  className="card-img"
                />

                <div className="card-info">
                  <h2 className="title-pink">
                    {b.title || b.trainerName}
                  </h2>

                  {b.type && <p>Тип: {b.type}</p>}

                  <p>Дата: {b.date}</p>
                  <p>Время: {b.time}</p>

                  {diff < 0 ? (
                    <p className="expired">
                      Тренировка уже прошла
                    </p>
                  ) : diff < 3 ? (
                    <p className="too-late">
                      Отмена минимум за 3 час до начала
                    </p>
                  ) : (
                    <button
                      className="cancel-btn"
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API}/api/bookings/${b._id}`,
                            { method: "DELETE" }
                          );

                          const data = await res.json();

                          if (!res.ok) {
                            setMessage(data.message);
                            return;
                          }

                          setMessage("Запись отменена");
                          fetchBookings();
                        } catch {
                          setMessage("Ошибка");
                        }
                      }}
                    >
                      Отменить запись
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  </>
);
}

export default MyBookings;