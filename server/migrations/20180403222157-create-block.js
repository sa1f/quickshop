'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Blocks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      block_num: {
        type: Sequelize.INTEGER
      },
      nonce: {
        type: Sequelize.INTEGER
      },
      data: {
        type: Sequelize.TEXT
      },
      prev_hash: {
        type: Sequelize.STRING
      },
      curr_hash: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Blocks');
  }
};