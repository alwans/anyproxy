const {RewriteModel} = require('./model/rewriteModel');
const {HttpsConfigModel} =  require('./model/httpsConfigModel');

const RuleTypeMap = {
    REWRITE:'REWRITE',
    REMOTE:'REMOTE',
    LOCAL_MAP:'LOCAL_MAP'
}

async function saveRuleInfo(info){
    switch(info.type){
        case RuleTypeMap.REWRITE:{
            await saveHttpsConfig(info.ruleInfo);
            await RewriteModel.create(info.ruleInfo);
            break;
        }
        case RuleTypeMap.REMOTE:{
            break;
        }
        case RuleTypeMap.LOCAL_MAP:{
            break;
        }
        default:{
            console.log('类型不存在');
        }
    }
}


async function saveHttpsConfig(obj){
    if(obj.host.includes('https')){
        HttpsConfigModel.create({
            domain: obj.host,
            isDelete: false,
            createTime: new Date().getTime(),
            modifyTime: new Date().getTime(),
            addUser: 'admin'
        });
    }
}


module.exports = {
    saveRuleInfo
}