'use strict';
module.exports = (sequelize, DataTypes) => {
  var Session = sequelize.define('Session', {
    token: DataTypes.STRING,
    valid: DataTypes.BOOLEAN
  }, {});
  Session.associate = function(models) {
    Session.belongsTo(models.User);
    Session.hasOne(models.Return);
    Session.hasOne(models.Cart);
    Session.hasOne(models.Purchase);
  };
  return Session;
};