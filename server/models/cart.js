'use strict';
module.exports = (sequelize, DataTypes) => {
  var Cart = sequelize.define('Cart', {}, {});
  Cart.associate = function(models) {
    Cart.belongsTo(models.Session);
    Cart.hasOne(models.Purchase);
    Cart.hasMany(models.ProductInCart);
  };
  return Cart;
};