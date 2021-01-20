const { Sequelize } = require('sequelize');
const dataBaseConfig = require('./config').dataBaseconfig;

class DataProvider{
    constructor(){
        this.sequelize =  new Sequelize(dataBaseConfig.baseName, dataBaseConfig.username, dataBaseConfig.password, {
            host: dataBaseConfig.ip,
            dialect: "mysql", // mysql/postgre/sql server/sql lite
            operatorsAliases: false,
            // logging: false, 
        })
    }

    static getInstance(){
        if(!DataProvider.instance){
            DataProvider.instance = new DataProvider();
        }
        return DataProvider.instance;
    }
}

// async function test(){
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//       } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }
// test();
module.exports = {
    DataProvider
}