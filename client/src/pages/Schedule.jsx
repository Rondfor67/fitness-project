import { useEffect, useState } from "react";
import { getUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { API } from "../api";

const TRAINING_TYPES = [
  "Fly yoga",
  "Aero stretching",
  "Stretching",
  "Силовая",
  "МФР + здоровая спина",
  "Пилатес"
];

const TRAINING_DATA = {
  "Fly yoga": {
    description: "Тренировка в гамаках, направленная на растяжку, расслабление и снятие напряжения.",
    image: "/images/fly.webp"
  },
  "Aero stretching": {
    description: "Глубокая растяжка с использованием специальных полотен для безопасного увеличения гибкости.",
    image: "/images/aero.webp"
  },
  "Stretching": {
    description: "Классическая тренировка на развитие гибкости и подвижности суставов.",
    image: "/images/stretch.webp"
  },
  "Силовая": {
    description: "Интенсивная тренировка для укрепления мышц и развития силы.",
    image: "/images/power.webp"
  },
  "МФР + здоровая спина": {
    description: "Комплекс упражнений с элементами миофасциального релиза для восстановления мышц и улучшения состояния спины.",
    image: "/images/back.webp"
  },
  "Пилатес": {
    description: "Спокойная и эффективная тренировка для укрепления глубоких мышц и улучшения осанки.",
    image: "/images/pilates.webp"
  }
};

function Schedule() {
  const [trainings, setTrainings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    trainer:"",
    date: "",
    time: "",
    slots: 7
  });

  const user = getUser();
  const navigate = useNavigate();

  const fetchTrainings = async () => {
  setLoading(true);

  const res = awaitfetch(`${API}/api/trainings`);
  const data = await res.json();
  setTrainings(data);

  setLoading(false);
  };

  useEffect(() => {
    fetchTrainings();
  }, []);
  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 3000);

  return () => clearTimeout(timer);
  }, [message]);

  const handleAdd = async () => {

if (!form.title || !form.date || !form.time) {
  setMessage("Заполни все поля");
  return;
}

if (form.slots < 2) {
  setMessage("Минимум 2 человека");
  return;
}

const [hours] = form.time.split(":").map(Number);

if (hours < 7 || hours > 23) {
  setMessage("Время должно быть с 07:00 до 23:00");
  return;
}

const now = new Date();
const trainingDateTime = new Date(`${form.date}T${form.time}`);
const diffMs = trainingDateTime - now;
const diffHours = diffMs / (1000 * 60 * 60);

if (diffMs <= 0) {
  setMessage("Нельзя создать тренировку в прошлом");
  return;
}

const isToday =
  new Date(form.date).toDateString() === now.toDateString();

if (isToday && diffHours < 3) {
  setMessage("Можно создать тренировку минимум за 3 часа до начала");
  return;
}

    const res = await fetch(`${API}/api/trainings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...form,
      description: TRAINING_DATA[form.title]?.description,
      image: TRAINING_DATA[form.title]?.image
    })
});

const data = await res.json();

if (!res.ok) {
  setMessage(data.message);
  return;
}

    setForm({
      title: "",
      date: "",
      time: "",
      slots: 7
    });

    fetchTrainings();
  };

  const joinTraining = async (t) => {
    if (!user) {
      setMessage("Вы не вошли в аккаунт");
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      setMessage("Данная функция доступна только пользователям");
      return;
    }

    if ((t.participants || []).includes(user.id)) {
      setMessage("Вы уже записаны");
      return;
    }

    if ((t.participants || []).length >= t.slots) {
      setMessage("Запись закрыта");
      return;
    }

    const res = await fetch(`${API}/api/trainings/${t._id}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user.id })
      }
    );

    const data = await res.json();

    if (res.ok) {
      setMessage("Вы успешно записались");
    } else {
      setMessage(data.message || "Ошибка");
    }

    fetchTrainings();
  };

  const deleteTraining = async (id) => {
    if (!window.confirm("Удалить тренировку?")) return;

    await fetch(`${API}/api/trainings/${id}`, {
      method: "DELETE"
    });

    fetchTrainings();
  };

  const editTraining = async (t) => {
    const newTitle = prompt(
      "Выбери:\n" + TRAINING_TYPES.join("\n"),
      t.title
    );

    if (!TRAINING_TYPES.includes(newTitle)) {
      setMessage("Выбери из списка");
      return;
    }

    const time = prompt("Время", t.time);
    const date = prompt("Дата (YYYY-MM-DD)", t.date);

    await fetch(`${API}/api/trainings/${t._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: newTitle,
        time,
        date,
        description: TRAINING_DATA[newTitle]?.description,
        image: TRAINING_DATA[newTitle]?.image
      })
    });

    fetchTrainings();
  };

  return (
    <>
      <NavBar title="" />

      <h1 className="text">Групповые тренировки</h1>

      <div className="container">

        {message && <div className="message">{message}</div>}

        {user?.role === "admin" && (
          <div className="form-wrapper">
            <div className="form">
              <h3>Добавить тренировку</h3>

              <select
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              >
                <option value="">Выбери тренировку</option>
                {TRAINING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={form.trainer}
                onChange={(e) =>
                  setForm({ ...form, trainer: e.target.value })
                }
              >
                <option value="">Выбери тренера</option>
                <option value="Алина">Алина</option>
                <option value="Элона">Элона</option>
                <option value="Роман">Роман</option>
                <option value="Амина">Амина</option>
                <option value="Ербол">Ербол</option>
                <option value="Алия">Алия</option>
              </select>

              <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />

              <input
                type="time"
                min="07:00"
                max="23:00"
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
              />

              <input
                type="number"
                min="2"
                value={form.slots}
                onChange={(e) =>
                  setForm({ ...form, slots: e.target.value })
                }
              />

              <button onClick={handleAdd}>
                Добавить
              </button>
            </div>
          </div>
        )}

<div className="cards">

  {loading && <p className="message">Загрузка...</p>}
          
   {trainings.map((t) => {
    const taken = (t.participants || []).length;
    const isFull = taken >= t.slots;
    const isJoined = (t.participants || []).includes(user?.id);

    return (
      <div key={t._id} className="card">

        <img src={t.image || "/images/default.webp"} />

        <div className="card-info">
          <h2 className="title-pink">{t.title}</h2>

          <p className="info-line">Тренер: {t.trainer}</p>
          <p className="info-line">Время: {t.time}</p>
          <p className="info-line">Дата: {t.date}</p>
          <p className="info-line">Места: {taken} / {t.slots}</p>

          <p className="desc">{t.description}</p>

          {/* ВСЕ ВМЕСТЕ */}
          <div className="card-actions">

            {isFull ? (
              <span className="no-slots">Запись закрыта</span>
            ) : isJoined ? (
              <span className="success">Вы уже записаны</span>
            ) : (
              <button
                className="main-btn"
                onClick={() => joinTraining(t)}
              >
                Записаться
              </button>
            )}

            {user?.role === "admin" && (
              <>
                <button onClick={() => editTraining(t)}>
                  Редактировать
                </button>

                <button onClick={() => deleteTraining(t._id)}>
                  Удалить
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    );
  })}
</div>
      </div>
    </>
  );
}

export default Schedule;