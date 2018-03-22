'use strict';
module.exports = (sequelize, DataTypes) => {
  var ProductInStore = sequelize.define('ProductInStore', {
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    picture: DataTypes.BLOB
  }, {});
  ProductInStore.associate = function(models) {
    ProductInStore.hasMany(models.ProductInCart);
    ProductInStore.hasMany(models.ProductReturned);
    ProductInStore.hasOne(models.ProductPrice);
  };
  return ProductInStore;
};