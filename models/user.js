'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Связь: пользователь имеет много задач
      User.hasMany(models.Todo, {
        foreignKey: 'user_id',
        as: 'todos'
      });
    }

    // Метод для проверки пароля
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      role: {
        type: DataTypes.STRING(20),
        defaultValue: 'user'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true
    }
  );

  return User;
};
