const {DataTypes, Model } = require('sequelize');
const {DataProvider} = require('../dataProvider');
const sequelize =  DataProvider.getInstance().sequelize;

class OriginRecordModel extends Model {}

OriginRecordModel.init({
  // Model attributes are defined here
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    _id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    host: {
        type: DataTypes.STRING,
        allowNull: true
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    relativePath:{
        type: DataTypes.STRING,
        allowNull: false
    },
    method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reqHeader: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reqBody: {
        type: DataTypes.STRING,
        allowNull: true
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: true
    },
    statusCode: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resHeader: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    length: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    clientIp: {
        type: DataTypes.STRING,
        allowNull: true
    },


}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'OriginRecordModel', // We need to choose the model name
  tableName:'t_proxy_originRecord'
});

// the defined model is the class itself
// console.log(HttpsConfigModel === sequelize.models.HttpsConfigModel); // true
// OriginRecordModel.sync(); //创建表
// OriginRecordModel.sync({ force: true }); //更新表

// async function test(){
//     const httpsConfigs = await HttpsConfigModel.findAll({
//     //    where:{
//     //        urlDomain:'net.acar168.cn:5509'
//     //    }
//     });
//     // console.log(rewrites.every(rewrite => rewrite instanceof Rewrite)); // true
//     console.log(httpsConfigs.length);
//     console.log("All httpsConfigs:", JSON.stringify(httpsConfigs, null, 2));
// }

// test();


module.exports = {
    OriginRecordModel
}
