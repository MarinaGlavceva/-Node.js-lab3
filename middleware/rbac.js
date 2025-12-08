const { Role, Permission, RolePermission, UserRole } = require('../models');

async function checkPermission(userId, permissionName) {
  // Получаем все роли пользователя
  const roles = await UserRole.findAll({ where: { user_id: userId } });
  const roleIds = roles.map(r => r.role_id);

  // Проверяем, есть ли нужное разрешение
  const allowed = await RolePermission.findOne({
    include: [{
      model: Permission,
      where: { action: permissionName }
    }],
    where: { role_id: roleIds }
  });

  return !!allowed;
}

module.exports = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const hasPermission = await checkPermission(userId, permissionName);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Доступ запрещён' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Ошибка проверки разрешений' });
    }
  };
};
