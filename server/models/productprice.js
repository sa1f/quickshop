'use strict';
module.exports = (sequelize, DataTypes) => {
  var ProductPrice = sequelize.define('ProductPrice', {}, {});
  ProductPrice.associate = function(models) {
    ProductPrice.belongsTo(models.ProductInStore);
  };
  return ProductPrice;
};