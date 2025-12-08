const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// секретный ключ (можно хранить в .env)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

module.exports = {
  // 🔹 Регистрация
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверка на уникальность
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser)
        return res.status(400).json({ message: 'Email уже зарегистрирован' });

      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: 'user'
      });

      res.status(201).json({
        message: 'Пользователь зарегистрирован',
        user: { id: newUser.id, username: newUser.username, email: newUser.email }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🔹 Вход (логин)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Неверный пароль' });

      // Генерация токена
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ message: 'Успешный вход', token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🔹 Получение профиля
  async profile(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'email', 'role', 'createdAt']
      });

      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

      res.json(user);
    } catch (error) {
      res.status(401).json({ message: 'Невалидный токен' });
    }
  }
};
