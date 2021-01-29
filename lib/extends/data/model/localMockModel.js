const {DataTypes, Model } = require('sequelize');
const {DataProvider} = require('../dataProvider');
const sequelize =  DataProvider.getInstance().sequelize;

class LocalMockModel extends Model {}

LocalMockModel.init({
  // Model attributes are defined here
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    urlDomain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reqUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    localRes: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    modifyTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    addUser: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'admin',
    },
    isLimitIP: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    IP: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'LocalMockModel', // We need to choose the model name
  tableName:'t_proxy_localMock'
});


LocalMockModel.sync(); //创建表
// LocalMockModel.sync({ force: true }); //更新表



module.exports = {
    LocalMockModel
}
// exports.RewriteModel = RewriteModel;