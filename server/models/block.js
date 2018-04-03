'use strict';
module.exports = (sequelize, DataTypes) => {
  var Block = sequelize.define('Block', {
    block_num: DataTypes.INTEGER,
    nonce: DataTypes.INTEGER,
    data: DataTypes.TEXT,
    prev_hash: DataTypes.STRING,
    curr_hash: DataTypes.STRING
  }, {});
  Block.associate = function(models) {
    Block.belongsTo(models.Purchase);
  };
  return Block;
};