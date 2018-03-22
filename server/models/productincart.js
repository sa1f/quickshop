'use strict';
module.exports = (sequelize, DataTypes) => {
  var ProductInCart = sequelize.define('ProductInCart', {}, {});
  ProductInCart.associate = function(models) {
    ProductInCart.belongsTo(models.ProductInStore);
    ProductInCart.belongsTo(models.Cart);
  };
  return ProductInCart;
};