'use strict';
module.exports = (sequelize, DataTypes) => {
  var ProductReturned = sequelize.define('ProductReturned', {}, {});
  ProductReturned.associate = function(models) {
    ProductReturned.belongsTo(models.Return);
    ProductReturned.belongsTo(models.ProductInStore);
  };
  return ProductReturned;
};