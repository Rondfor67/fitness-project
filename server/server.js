const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({
  origin: "https://fitness-project-orcin.vercel.app",
  credentials: true
}));
app.use(express.json());

require("dotenv").config();

const SECRET = process.env.JWT_SECRET;
console.log("MONGO:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// USER
const User = mongoose.model("User", {
  name: String,
  surname: String,
  phone: String,
  password: String,
  role: { type: String, default: "user" }
});


// GROUP TRAININGS
const Training = mongoose.model("Training", {
  title: String,
  trainer: String,
  date: String,
  time: String,
  slots: Number,
  image: String,
  description: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

app.get("/api/trainings", async (req, res) => {
  const trainings = await Training.find();
  res.json(trainings);
});

app.post("/api/trainings", async (req, res) => {
  const { title, trainer, date, time, slots, description, image } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ message: "Заполни все поля" });
  }

  if (Number(slots) < 2) {
    return res.status(400).json({ message: "Минимум 2 человека" });
  }

  const now = new Date();
  const trainingDate = new Date(`${date} ${time}`);

  const diff = (trainingDate - now) / (1000 * 60 * 60);

  if (diff < 3) {
    return res.status(400).json({
      message: "Тренировку можно создать минимум за 3 часа"
    });
  }

  const hours = Number(time.split(":")[0]);

  if (hours < 7 || hours > 23) {
    return res.status(400).json({
      message: "Время должно быть с 07:00 до 23:00"
    });
  }

  const training = new Training({
    title,
    trainer,
    date,
    time,
    slots: Number(slots),
    description,
    image,
    participants: []
  });

  await training.save();
  res.json(training);
});
app.post("/api/trainings/:id/join", async (req, res) => {
  const { userId } = req.body;

  const training = await Training.findById(req.params.id);

  if (!training) {
    return res.status(404).json({ message: "Нет тренировки" });
  }

  if (training.participants.includes(userId)) {
    return res.status(400).json({ message: "Ты уже записан" });
  }

  if (training.participants.length >= training.slots) {
    return res.status(400).json({ message: "Мест нет" });
  }

  training.participants.push(userId);
  await training.save();

  const booking = new Booking({
    userId,
    trainerName: training.title,
    type: "Групповая",
    date: training.date,
    time: training.time,
    image: training.image
  });

  await booking.save();

  res.json(training);
});

app.delete("/api/bookings/:id", async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Не найдено" });
  }

  const now = new Date();
  const trainingDate = new Date(`${booking.date} ${booking.time}`);

  const diff = (trainingDate - now) / (1000 * 60 * 60);

  if (diff < 3) {
    return res.status(400).json({
      message: "Нельзя отменить менее чем за 3 часа"
    });
  }

  await Booking.findByIdAndDelete(req.params.id);

  res.json({ message: "Отменено" });
});

// TRAINERS
const Trainer = mongoose.model("Trainer", {
  name: String,
  type: String,
  photo: String,
  description: String,
  date: String,
  availableSlots: [String]
});


// BOOKINGS
const Booking = mongoose.model("Booking", {
  userId: String,
  trainerId: mongoose.Schema.Types.ObjectId,
  trainerName: String,
  type: String,
  image: String,
  date: String,
  time: String
});


// получить тренеров
app.get("/api/trainers", async (req, res) => {
  const trainers = await Trainer.find();
  res.json(trainers);
});


// создать тренера
app.post("/api/trainers", async (req, res) => {
  const { name, type, date, availableSlots } = req.body;

  if (!name || !type || !date) {
    return res.status(400).json({ message: "Заполни все поля" });
  }

  const photos = {
    "Йога": "https://images.unsplash.com/photo-1552196563-55cd4e45efb3",
    "Фитнес": "https://images.unsplash.com/photo-1518611012118-f1e3b0c2f9b4",
    "Стретчинг": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
  };
  const trainerPhotos = {
  "Алина": "/trainers/alina.webp",
  "Элона": "/trainers/elona.webp",
  "Роман": "/trainers/roman.webp",
  "Амина": "/trainers/amina.webp",
  "Ербол": "/trainers/erbol.webp",
  "Алия": "/trainers/aliya.webp"
};

const trainerDescriptions = {
  "Алина": "Помогу вам улучшить физическую форму, гибкость и уверенность в себе. Тренировки проходят в комфортной атмосфере, с вниманием к каждой детали и вашему результату.",
  "Элона": "Моя цель — сделать тренировки эффективными и приятными. Подберу нагрузку под ваш уровень и помогу двигаться к результату без стресса.",
  "Роман": "Работаю на результат: сила, выносливость и уверенность. Поддержу на каждом этапе и помогу раскрыть ваш потенциал.",
  "Амина": "Создаю комфортные и эффективные тренировки для любого уровня подготовки. Со мной вы полюбите процесс и увидите результат.",
  "Ербол": "Помогу вам стать сильнее, выносливее и увереннее. Тренировки строю с учётом ваших целей и возможностей.",
  "Алия": "Работаю над балансом, силой и самочувствием. На моих тренировках вы не только тренируетесь, но и получаете удовольствие от процесса."
};

const trainer = new Trainer({
  name,
  type,
  date,
  photo: trainerPhotos[name] || "/images/default.webp",
  description: trainerDescriptions[name] || "Индивидуальная тренировка",
  availableSlots
});

  await trainer.save();
  res.json(trainer);
});

app.post("/api/trainers/:id/book", async (req, res) => {
  const { time, userId } = req.body;
  console.log("SAVING USER ID:", userId);

  const trainer = await Trainer.findById(req.params.id);

  if (!trainer) {
    return res.status(404).json({ message: "Нет тренера" });
  }

  // удаляем слот
  trainer.availableSlots = trainer.availableSlots.filter(t => t !== time);
  await trainer.save();

  // создаём запись
  const booking = new Booking({
    userId,
    trainerName: trainer.name,
    type: trainer.type,
    date: trainer.date,
    time,
    image: trainer.photo
  });

  await booking.save();

  res.json({ message: "Успешно записан" });
});

app.get("/api/my-bookings/:userId", async (req, res) => {
  console.log("USER ID:", req.params.userId);

  const bookings = await Booking.find({
  userId: String(req.params.userId)
});

  console.log("FOUND BOOKINGS:", bookings);

  res.json(bookings);
});

//УДАЛЕНИЕ
app.delete("/api/trainings/:id", async (req, res) => {
  const training = await Training.findById(req.params.id);

  if (!training) {
    return res.status(404).json({ message: "Не найдено" });
  }

  await Training.findByIdAndDelete(req.params.id);

  res.json({ message: "Удалено" });
});


//РЕДАКТИРОВАНИЕ 
app.put("/api/trainings/:id", async (req, res) => {
  const { title, time, date } = req.body;

  const training = await Training.findById(req.params.id);

  if (!training) {
    return res.status(404).json({ message: "Не найдено" });
  }

  training.title = title || training.title;
  training.time = time || training.time;
  training.date = date || training.date;

  await training.save();

  res.json({ message: "Обновлено" });
});

//delete trainer
app.delete("/api/trainers/:id", async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);

  if (!trainer) {
    return res.status(404).json({ message: "Не найдено" });
  }

  await Trainer.findByIdAndDelete(req.params.id);

  res.json({ message: "Удалено" });
});

//редактирование
app.put("/api/trainers/:id", async (req, res) => {
  const { name, type, date, photo, description } = req.body;

  const trainer = await Trainer.findById(req.params.id);

  if (!trainer) {
    return res.status(404).json({ message: "Не найдено" });
  }

  trainer.name = name || trainer.name;
  trainer.type = type || trainer.type;
  trainer.date = date || trainer.date;
  trainer.photo = photo || trainer.photo;
  trainer.description = description || trainer.description;

  await trainer.save();

  res.json({ message: "Обновлено" });
});

// AUTH
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, phone, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = new User({
    name: firstName,
    surname: lastName,
    phone,
    password: hash
  });

  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({
    token,
    user: {
      id: user._id,
      firstName: user.name,
      lastName: user.surname,
      phone: user.phone,
      role: user.role
    }
  });
});

app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
  return res.status(400).json({ message: "Пользователь не найден" });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!user || !isMatch) {
    return res.status(400).json({ message: "Ошибка" });
  }

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({
    token,
    user: {
      id: user._id,
      firstName: user.name,
      lastName: user.surname,
      phone: user.phone,
      role: user.role
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server started on " + PORT);
});