const {RewriteModel} = require('./model/rewriteModel');
const {HttpsConfigModel} =  require('./model/httpsConfigModel');
const { ItemTableMap, HeaderOperationMap, ProxyRecordTypeMap } = require('./constant');


const RuleTypeMap = {
    REWRITE:'REWRITE',
    REMOTE:'REMOTE',
    LOCAL_MAP:'LOCAL_MAP'
}

async function saveRuleInfo(info){
    switch(info.type){
        case RuleTypeMap.REWRITE:{
            await saveHttpsConfig(info.ruleInfo);
            let new_ruleInfo = web2serverFormat(info.ruleInfo);
            await RewriteModel.create(new_ruleInfo);
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

async function fetchRuleList(query){
    let rewriteList = await RewriteModel.findAll({
        where:{
            isReqData: query.reqType,
            urlDomain: query.urlHost
        }
    });
    let newRuleList = [];
    for(let obj of rewriteList){
        if(matchUrl(query.urlPath,obj)){
            let new_obj = {
                name: obj.id,
                disabled: true,
                ruleInfo:  server2webFormat(obj)
            }
            newRuleList.push(new_obj);
        }
    }
    let result = {};
    result[ProxyRecordTypeMap.REWRITE] = newRuleList;
    result[ProxyRecordTypeMap.REMOTE] = [];
    result[ProxyRecordTypeMap.LOCAL_MAP] = [];
    return result;

}

function web2serverFormat(obj){
    let new_obj = Object.assign({}, obj);
    new_obj.isGlobal = obj.isGlobal==='yes'? 1: 0;
    new_obj.isDelete = obj.isDelete==='yes'? 1: 0;
    new_obj.isLimitIP = obj.isLimitIP==='yes'? 1: 0;
    new_obj.originHeaderParam = headerParam2server(obj.originHeaderParam, 'beforeData');
    new_obj.targetHeaderParam =  headerParam2server(obj.targetHeaderParam, 'afterData');
    new_obj.originBody = bodyParam2server(obj.originBody, obj.method, obj.isReqData, 'beforeData');
    new_obj.targetBody = bodyParam2server(obj.originBody, obj.method, obj.isReqData, 'afterData');
    return new_obj; 
}

function server2webFormat(obj){
    obj.isGlobal = obj.isGlobal ? 'yes' : 'no';
    obj.isDelete = obj.isDelete ? 'yes' : 'no';
    obj.isLimitIP = obj.isLimitIP ? 'yes' : 'no';
    const defaultBaseConfig = {req:[{key:0,regexUrl:'',isGolbal:'no',isDisable:'no',isIpLimit:'no',ipList:'',remoteUrl:'',tableType:ItemTableMap.TABLE_BASE}],
    res:[{key:0,regexUrl:'',isGolbal:'no',isDisable:'no',isIpLimit:'no',ipList:'',remoteUrl:'',tableType:ItemTableMap.TABLE_BASE}]};
    const bodyItem = {req:[],res:[]};      //obj-keys:[tableType,beforData,afterData,isDelete]
    const headersItem = {req:[],res:[]};
    let o1 = {
        key: 0,
        regexUrl: obj.reqUrl,
        isGolbal: obj.isGlobal,
        isDisable: obj.isDelete,
        isIpLimit: obj.isLimitIP,
        ipList: obj.IP,
        remoteUrl: obj.remoteUrl || '',
        tableType: ItemTableMap.TABLE_BASE,
    };
    if(obj.isReqData===1){
        defaultBaseConfig.req = o1;
        headersItem.req = server2headerParam(obj.originHeaderParam, obj.targetHeaderParam);
        bodyItem.req = server2BodyParam(obj.method, obj.isReqData, obj.originBody, obj.targetBody);
    }else{
        defaultBaseConfig.res = o1;
        headersItem.res = server2headerParam(obj.originHeaderParam, obj.targetHeaderParam);
        bodyItem.res = server2BodyParam(obj.method, obj.isReqData, obj.originBody, obj.targetBody);
    }
    return {
        baseConfig: defaultBaseConfig,
        headersItem: headersItem,
        bodyItem: bodyItem
    }
}
function headerParam2server(headersList,dataIndex){// dataIndex:befroeData/afterData
    let arr = headersList.map(item =>{
      if(item[dataIndex]!==''){
        let obj= {};
        let var1 = item[dataIndex].split(':');
        obj[var1[0].trim()] = var1[1].trim();
        return obj;
      }
    }).filter(item => item!= void 0 );
    if(arr.length){
        return arr;
    }
    return null;
}

function server2headerParam(oriHeadersListStr,targetHeadersListStr){// dataIndex:befroeData/afterData
    if(oriHeadersListStr=='' && (targetHeadersListStr ==='' || targetHeadersListStr === null)) return [];
    // if(!oriHeadersListStr || oriHeadersListStr === '' || oriHeadersListStr === '[]') return [];
    let oriHeadersList = JSON.parse(oriHeadersListStr);
    let targetHeadersList = JSON.parse(targetHeadersListStr);
    let newIndex = 0;
    let arr1 = oriHeadersList.map(item =>{
        const newData = {
            key: newIndex,
            tableType:ItemTableMap.TABLE_HEADER,
            headerType: HeaderOperationMap.UPDATE,
            headerName:'',
            beforeData: '',
            afterData: '',
            isDelete: false,
        };
        let filed = Object.keys(item)[0];
        let {flag, target_obj} = isExist(filed,targetHeadersList)
        if(flag){
            newData.headerName = filed;
            newData.beforeData = item[filed];
            newData.afterData = target_obj[filed];
        }else{
            newData.headerType = HeaderOperationMap.DELETE;
            newData.headerName = filed;
            newData.beforeData = item[filed];
        }
        newIndex++;
        return newData;
    }).filter(item => item!= void 0 );
    let arr2 = targetHeadersList.map(item => {
        const newData = {
            key: newIndex,
            tableType:ItemTableMap.TABLE_HEADER,
            headerType: HeaderOperationMap.UPDATE,
            headerName:'',
            beforeData: '',
            afterData: '',
            isDelete: false,
        };
        let filed = Object.keys(item)[0];
        let {flag, target_obj} = isExist(filed,oriHeadersList)
        if(!flag){
            newData.headerType = HeaderOperationMap.ADD;
            newData.headerName = filed;
            newData.afterData = item[filed];
            newIndex++;
            return newData;
        }
    }).filter(item => item!= void 0 );;
    return [...arr1,...arr2];
}

function server2BodyParam(method, reqType, oriBodyStr, targerBodyStr){
    if(oriBodyStr==='' || oriBodyStr === null) return [];
    let newIndex = 0;
    if(method==='GET' && reqType===1){
        let oriBody = JSON.parse(oriBodyStr);
        let targetBody =  JSON.parse(targerBodyStr);
        let arr = oriBody.map(item => {
            let filed = Object.keys(item)[0];
            let {flag ,target_obj} = isExist(filed, targetBody);
            if(flag){
                let newData = {
                    key: newIndex,
                    tableType:ItemTableMap.TABLE_BODY,
                    beforeData: '',
                    afterData: '',
                    isDelete: false,
                };
                newData.beforeData = filed+ '=' + item[filed];
                newData.afterData = filed + '=' + target_obj[filed];
                newIndex++;
                return newData;
            }
        });
        return arr;
    }else{
        let ori_arr = oriBodyStr.split("&");
        let target_arr = targerBodyStr.split('&');
        let arr = ori_arr.map((item,index) => {
            let newData = {
                key: newIndex,
                tableType:ItemTableMap.TABLE_BODY,
                beforeData: '',
                afterData: '',
                isDelete: false,
            };
            newData.beforeData = item;
            newData.afterData =  target_arr[index];
            newIndex++;
            return newData;
        });
        return arr;
    }

}

/**
 * 对用的请求头中的key是否存在
 * @param {*} obj 
 * @param {*} objs 
 */
const isExist = function(filed, objs){
    let flag = false;
    let target_obj = null;
    objs.some(v => {
        let f = Object.keys(v)[0];
        if(f===filed){
            flag = true;
            target_obj = v;
            return {flag, target_obj};
        }
    });
    return {flag, target_obj};
}

function  bodyParam2server(bodyList, method, reqType, dataIndex){  //method:get/post  ;reqType:req/res ; dataIndex:befroeData/afterData
    if(method==='GET' && reqType===1){
      let arr =  bodyList.map(item =>{
        let var1 = item[dataIndex].split('=');
        if(var1.length>1){
          let obj ={};
          obj[var1[0].trim()] = var1[1].trim();
          return obj;
        }
        return item[dataIndex]
      })
      return JSON.stringify(arr);
    }else{
      let arr = bodyList.map(item =>{
        return item[dataIndex];
      });
      return arr.join('&');
    }
}

async function saveHttpsConfig(obj){
    if(obj.urlDomain.includes('https')){
        HttpsConfigModel.create({
            domain: obj.urlDomain,
            isDelete: false,
            createTime: new Date().getTime(),
            modifyTime: new Date().getTime(),
            addUser: 'admin'
        });
    }
}

/**
 * 匹配请求地址和数据库中的拦截信息是否相同
 * @param {str} ori_req_url 拦截的请求地址
 * @param {sql_result_item} obj 数据库中的数据
 */
const matchUrl= (ori_req_url,obj) =>{
    let i_req_url = obj.reqUrl;
    let r1 = new RegExp('\\*','ig');
    i_req_url = i_req_url.replace(r1,'.*');
    var re = new RegExp(i_req_url,'ig');
    if(re.test(ori_req_url)) return true;
    return false;
}
async function test(){
    let query = {
        reqType: 1,
        urlHost: 'www.acar168.cn:5509',
        urlPath: '/staff-client-interfaces/m/system/login/2_5_5',
    };
    let result = await fetchRuleList(query);
    console.log(result);
}

test();

module.exports = {
    saveRuleInfo,
    fetchRuleList
}

