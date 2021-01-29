const {DataTypes, Model } = require('sequelize');
const {DataProvider} = require('../dataProvider');
const sequelize =  DataProvider.getInstance().sequelize;

class HttpsConfigModel extends Model {}

HttpsConfigModel.init({
  // Model attributes are defined here
    domain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue:0
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    modifyTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    addUser: {
        type: DataTypes.INTEGER,
        allowNull: true
    },


}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'HttpsConfigModel', // We need to choose the model name
  tableName:'t_proxy_httpsConfig'
});

// the defined model is the class itself
// console.log(HttpsConfigModel === sequelize.models.HttpsConfigModel); // true
HttpsConfigModel.sync()

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
    HttpsConfigModel
}