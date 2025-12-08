'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'user_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users', // имя таблицы
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('todos', 'user_id');
  }
};
