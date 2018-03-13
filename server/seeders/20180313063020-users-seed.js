'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      name: 'Saif Sajid',
      passwordHash: "$2b$10$yUMumltd.mHO3NTwTrpsI.CfHPUYBWjZ3lMuv.OFMyIQMQmpPm1F2",
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', [{
      name: 'Saif Sajid'
    }])
  }
};
