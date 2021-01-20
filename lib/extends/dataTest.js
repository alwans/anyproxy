const {RewriteModel} = require('./model/rewriteModel');
const {HttpsConfigModel} =  require('./model/httpsConfigModel');





async function test(){
    const rewrites = await RewriteModel.findAll({
        where:{
            urlDomain:'net.acar168.cn:5509'
        }
     });
    const httpsConfigs = await HttpsConfigModel.findAll();
    console.log(rewrites.length);
    console.log(httpsConfigs.length);
}

test();


