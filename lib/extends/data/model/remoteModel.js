const {DataTypes, Model } = require('sequelize');
const {DataProvider} = require('../dataProvider');
const sequelize =  DataProvider.getInstance().sequelize;

class RemoteModel extends Model {}

RemoteModel.init({
  // Model attributes are defined here
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    recorderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    urlDomain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reqUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetUrl: {
        type: DataTypes.STRING,
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
  modelName: 'RemoteModel', // We need to choose the model name
  tableName:'t_proxy_remote'
});


// RemoteModel.sync(); //创建表
RemoteModel.sync({ force: true }); //更新表



module.exports = {
    RemoteModel
}
// exports.RewriteModel = RewriteModel;