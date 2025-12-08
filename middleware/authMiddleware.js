const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 🔹 Проверка JWT и извлечение пользователя
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Требуется токен' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });

    req.user = user; // записываем в объект запроса
    next();
  } catch (err) {
    res.status(401).json({ message: 'Невалидный или просроченный токен' });
  }
};

// 🔹 Проверка роли "admin"
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещён: требуется роль admin' });
  }
  next();
};

// 🔹 Проверка, является ли пользователь владельцем ресурса или админом
const isOwnerOrAdmin = (getOwnerIdFn) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getOwnerIdFn(req);
      if (req.user.role === 'admin' || req.user.id === ownerId) {
        return next();
      }
      return res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { authenticateToken, isAdmin, isOwnerOrAdmin };
