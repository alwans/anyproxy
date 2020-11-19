const mysql = require('mysql')
const dataBaseConfig = require('./config').dataBaseconfig

var connection = void 0

const connet = async() =>{
    console.log('开始连接数据库...')
    let result = new Promise((resolve,reject) =>{
        connection = mysql.createConnection({
            host:dataBaseConfig.ip,
            port:dataBaseConfig.port,
            user:dataBaseConfig.username,
            password:dataBaseConfig.password,
            database:dataBaseConfig.baseName
        })
        connection.connect((err) =>{
            if(err) console.log(`数据库连接失败:${err}`) && reject(new Error(`数据库连接失败:${err}`))
            console.log('数据库连接成功');
            resolve('数据库连接成功')
        })
    })
    return result
}

// connection.connect((err) =>{
//     if(err) console.log(`数据库连接失败:${err}`)
//     console.log('数据库连接成功');
// })


/**
 * 
 * @param {*} sql 
 */
const query = async (sql) => {
    if(connection === void 0){
        await connet();
    }  
    return new Promise((resolve,reject) =>{
        // console.log(`-----start query sql-----:${sql}`);
        try{
            connection.query(sql,(err,result) =>{
                if(err) reject(new Error(`sql查询失败:${err}`)) 
                resolve(result);
            });
        }catch(e){
            reject(new Error('数据库查询异常'))
        }
    });
    // let result = new Promise((resolve,reject) =>{
    //     connection.query(sql,(err,result) =>{
    //         if(err) reject( new Error(`sql查询失败:${err}`)) 
    //         resolve(result) 
    //     });
    // })
    // return result
} 



const close = () =>{
    connection.end((err) =>{
        if(err) console.log(`数据库断开连接异常:${err}`);
        console.log('数据库已断开连接');
    });
}

/**
 * 关闭数据库连接
 */
// connection.end((err) =>{
//     if(err) console.log(`数据库断开连接异常:${err}`);
//     console.log('数据库已断开连接');
// });


module.exports={
    connet,
    query,
    close
}