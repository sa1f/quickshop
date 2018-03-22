'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: DataTypes.BLOB,
    faceEncoding: DataTypes.STRING,
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Session);
    User.hasMany(models.Purchase);
  };
  return User;
};