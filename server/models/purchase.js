'use strict';
module.exports = (sequelize, DataTypes) => {
  var Purchase = sequelize.define('Purchase', {}, {});
  Purchase.associate = function(models) {
    Purchase.belongsTo(models.User);
    Purchase.belongsTo(models.Session);
    Purchase.belongsTo(models.Cart);
    Purchase.hasMany(models.Return);
  };
  return Purchase;
};