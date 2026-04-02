import { useEffect, useState } from "react";
import { getUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { API } from "../api";

const TRAINERS = [
  "Алина",
  "Элона",
  "Роман",
  "Амина",
  "Ербол",
  "Алия"
];

const TRAINER_DATA = {
  "Алина": {
    photo: "/trainers/alina.webp",
    description: "Помогу вам улучшить физическую форму, гибкость и уверенность в себе. Тренировки проходят в комфортной атмосфере, с вниманием к каждой детали и вашему результату."
  },
  "Элона": {
    photo: "/trainers/elona.webp",
    description: "Моя цель — сделать тренировки эффективными и приятными. Подберу нагрузку под ваш уровень и помогу двигаться к результату без стресса."
  },
  "Роман": {
    photo: "/trainers/roman.webp",
    description: "Работаю на результат: сила, выносливость и уверенность. Поддержу на каждом этапе и помогу раскрыть ваш потенциал."
  },
  "Амина": {
    photo: "/trainers/amina.webp",
    description: "Создаю комфортные и эффективные тренировки для любого уровня подготовки. Со мной вы полюбите процесс и увидите результат."
  },
  "Ербол": {
    photo: "/trainers/erbol.webp",
    description: "Помогу вам стать сильнее, выносливее и увереннее. Тренировки строю с учётом ваших целей и возможностей."
  },
  "Алия": {
    photo: "/trainers/aliya.webp",
    description: "Работаю над балансом, силой и самочувствием. На моих тренировках вы не только тренируетесь, но и получаете удовольствие от процесса."
  }
};

const TRAINING_TYPES = [
  "Fly yoga",
  "Aero stretching",
  "Stretching",
  "Силовая",
  "МФР + здоровая спина",
  "Пилатес"
];

function Individual() {
  const [trainers, setTrainers] = useState([]);
  const [selectedTime, setSelectedTime] = useState({});
  const user = getUser();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "",
    date: "",
    slots: ""
  });

  const fetchTrainers = async () => {
  setLoading(true);

  try {
    const res = await fetch(`${API}/api/trainers`);
    const data = await res.json();
    setTrainers(data);
  } catch (err) {
    setMessage("Ошибка загрузки");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 3000);

  return () => clearTimeout(timer);
  }, [message]);

  const isValidTime = (time) => {
  const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

  if (!regex.test(time)) return false;

  const [hours, minutes] = time.split(":").map(Number);

  if (hours < 7 || hours > 23) return false;

  return true;
};

  const handleAdd = async () => {
    if (!form.name || !form.type || !form.date || !form.slots) {
      setMessage("Заполни все поля");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (form.date < today) {
      setMessage("Нельзя выбрать прошедшую дату");
      return;
    }

    const slotsArray = form.slots
      .split(",")
      .map(s => s.trim());

    const invalidTimes = slotsArray.filter(t => !isValidTime(t));

    if (invalidTimes.length > 0) {
      setMessage("Неверное время. Используй формат HH:MM (07:00–23:00)");
      return;
    }
    const uniqueSlots = [...new Set(slotsArray)];

    await fetch(`${API}/api/trainers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        date: form.date,
        availableSlots: uniqueSlots,
        photo: TRAINER_DATA[form.name]?.photo,
        description: TRAINER_DATA[form.name]?.description
      })
    });

    setForm({
      name: "",
      type: "",
      date: "",
      slots: ""
    });

    fetchTrainers();
  };

  const book = async (id) => {
    if (!user) {
      setMessage("Вы не вошли в аккаунт");
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      setMessage("Данная функция доступна только пользователям");
      return;
    }

    const time = selectedTime[id];

    if (!time) {
      setMessage("Выберите время");
      return;
    }

    const res = await fetch(`${API}/api/trainers/${id}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        time
      })
    });

    if (res.ok) {
      setMessage("Вы успешно записались");
    }

    fetchTrainers();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long"
    });
  };

  const deleteTrainer = async (id) => {
  if (!window.confirm("Удалить тренировку?")) return;

  await fetch(`${API}/api/trainers/${id}`, {
    method: "DELETE"
  });

  fetchTrainers();
};

const editTrainer = async (t) => {
  const name = prompt("Выбери тренера:\n" + TRAINERS.join("\n"), t.name);

  if (!TRAINERS.includes(name)) {
    setMessage("Выбери из списка");
    return;
  }

  const type = prompt("Тип тренировки:\n" + TRAINING_TYPES.join("\n"), t.type);

  if (!TRAINING_TYPES.includes(type)) {
    setMessage("Выбери из списка");
    return;
  }

  const date = prompt("Дата (YYYY-MM-DD)", t.date);

  await fetch(`${API}/api/trainers/${t._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      type,
      date,
      photo: TRAINER_DATA[name]?.photo,
      description: TRAINER_DATA[name]?.description
    })
  });

  fetchTrainers();
};
  return (
    <>

      <NavBar title="" />
      <h1 className="text">Индивидуальные тренировки</h1>
      <div className="container">
        {message && <div className="message">{message}</div>}

        {loading && <div className="message">Загрузка...</div>}

        {user?.role === "admin" && (
          <div className="form-wrapper">
            <div className="form">
              <h3>Добавить тренировку</h3>

              <select
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              >
                <option value="">Выбери тренера</option>
                {TRAINERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option value="">Тип тренировки</option>
                {TRAINING_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
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
                placeholder="Время (10:00, 12:00)"
                value={form.slots}
                onChange={(e) =>
                  setForm({ ...form, slots: e.target.value })
                }
              />

              <button onClick={handleAdd}>Добавить</button>
            </div>
          </div>
        )}

        <div className="cards">
  {trainers.map((t) => (
    <div key={t._id} className="card">

      <img src={t.photo || "/images/default.webp"} className="card-img" />

      <div className="card-info">
        <h2 className="title-pink">{t.name}</h2>
        <p className="info-line">Тип: {t.type}</p>
        <p className="info-line">Дата: {formatDate(t.date)}</p>
        <p className="desc">{t.description}</p>

        {/* время */}
        {(t.availableSlots || []).length === 0 ? (
  <p className="no-slots">
    
  </p>
) : (
  <div className="time-list">
    {t.availableSlots.map((time) => (
      <button
        key={time}
        className={
          selectedTime[t._id] === time
            ? "time-btn active"
            : "time-btn"
        }
        onClick={() =>
          setSelectedTime({
            ...selectedTime,
            [t._id]: time
          })
        }
      >
        {time}
      </button>
    ))}
  </div>
)}

        {/* все кнопки вместе */}
        <div className="card-actions">

          <button
          className="main-btn"
          disabled={(t.availableSlots || []).length === 0}
          onClick={() => book(t._id)}
        >
          {(t.availableSlots || []).length === 0
            ? "Мест нет"
            : "Записаться"}
        </button>
        
          {user?.role === "admin" && (
            <>
              <button onClick={() => editTrainer(t)}>
                Редактировать
              </button>

              <button onClick={() => deleteTrainer(t._id)}>
                Удалить
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  ))}
</div>
      </div>
    </>
  );
}

export default Individual;