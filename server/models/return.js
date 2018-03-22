'use strict';
module.exports = (sequelize, DataTypes) => {
  var Return = sequelize.define('Return', {}, {});
  Return.associate = function(models) {
    Return.belongsTo(models.Session);
    Return.belongsTo(models.Purchase);
    Return.hasMany(models.ProductReturned);
  };
  return Return;
};