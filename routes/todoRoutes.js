const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { authenticateToken, isOwnerOrAdmin } = require('../middleware/authMiddleware');

// Применяем проверку токена ко всем маршрутам
router.use(authenticateToken);

router.get('/', todoController.getAll);
router.get('/:id', isOwnerOrAdmin(async (req) => {
  const todo = await require('../models').Todo.findByPk(req.params.id);
  return todo ? todo.user_id : null;
}), todoController.getById);

router.post('/', todoController.create);
router.put('/:id', isOwnerOrAdmin(async (req) => {
  const todo = await require('../models').Todo.findByPk(req.params.id);
  return todo ? todo.user_id : null;
}), todoController.update);

router.delete('/:id', isOwnerOrAdmin(async (req) => {
  const todo = await require('../models').Todo.findByPk(req.params.id);
  return todo ? todo.user_id : null;
}), todoController.remove);

module.exports = router;
