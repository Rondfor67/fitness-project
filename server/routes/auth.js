const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "supersecretkey"; 

//РЕГИСТРАЦИЯ
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, password } = req.body;

    // проверка
    if (!firstName || !lastName || !phone || !password) {
      return res.json({ error: "Заполните все поля" });
    }

    // существует ли пользователь
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.json({ error: "Пользователь уже существует" });
    }

    // хеш пароля
    const hash = await bcrypt.hash(password, 10);

    // создаём пользователя
    const user = new User({
      firstName,
      lastName,
      phone,
      password: hash,
    });

    await user.save();

    // создаём токен
    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});


//ВХОД
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // проверка
    if (!phone || !password) {
      return res.json({ error: "Введите телефон и пароль" });
    }

    // ищем пользователя
    const user = await User.findOne({ phone });
    if (!user) {
      return res.json({ error: "Пользователь не найден" });
    }

    // проверяем пароль
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.json({ error: "Неверный пароль" });
    }

    // токен
    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;