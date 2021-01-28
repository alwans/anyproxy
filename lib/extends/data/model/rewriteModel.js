const {DataTypes, Model } = require('sequelize');
const {DataProvider} = require('../dataProvider');
const sequelize =  DataProvider.getInstance().sequelize;

class RewriteModel extends Model {}

RewriteModel.init({
  // Model attributes are defined here
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    recorderID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    method: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isReqData: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    urlDomain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reqUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    headerType: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    headerEnum: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    originHeaderParam: {
        type: DataTypes.JSON,
        allowNull: true
    },
    targetHeaderParam: {
        type: DataTypes.JSON,
        allowNull: true
    },
    httpStatusCode: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bodyEnum: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    originBody: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    targetBody: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isGlobal: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    isDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    createTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    modifyTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    addUser: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isLimitIP: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    IP: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remark: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'RewriteModel', // We need to choose the model name
  tableName:'t_proxy_rewrite'
});

// the defined model is the class itself
// console.log(RewriteModel === sequelize.models.RewriteModel); // true
// RewriteModel.sync(); //创建表
// RewriteModel.sync({ force: true }); //更新表

// async function test(){
//     // const rewrites = await RewriteModel.findAll();
//     const rewrites = await RewriteModel.findAll({
//        where:{
//            urlDomain:'net.acar168.cn:5509'
//        }
//     });
//     // console.log(rewrites.every(rewrite => rewrite instanceof Rewrite)); // true
//     console.log(rewrites.length);
//     // console.log("All rewrites:", JSON.stringify(rewrites, null, 2));
// }

// test();

module.exports = {
    RewriteModel
}
// exports.RewriteModel = RewriteModel;