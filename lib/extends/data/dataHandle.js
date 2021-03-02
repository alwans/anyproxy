const {RewriteModel} = require('./model/rewriteModel');
const {HttpsConfigModel} =  require('./model/httpsConfigModel');
const { ItemTableMap, HeaderOperationMap, ProxyRecordTypeMap } = require('../common/constant');
const { OriginRecordModel } = require('./model/originRecordModel');
const {updateData, findData} = require('./dataUtils');
const { RemoteModel } = require('./model/remoteModel');
const async = require('async');


const RuleTypeMap = {
    REWRITE:'REWRITE',
    REMOTE:'REMOTE',
    LOCAL_MAP:'LOCAL_MAP'
}

async function saveRuleInfo(info){
    await saveHttpsConfig(info.ruleInfo);
    let originRecord = info.originRecord;
    let originRecordId = await getOriginRecordId(originRecord);
    switch(info.type){
        case RuleTypeMap.REWRITE:{
            let new_ruleInfo = web2serverFormat(info.ruleInfo);
            if(new_ruleInfo.id === null){//id不存在就insert, id存在就update
                // let originRecordId = await getOriginRecordId(originRecord);
                new_ruleInfo.recorderID = originRecordId;
                await RewriteModel.create(new_ruleInfo);  
            }else{
                // let originRecordId = await getOriginRecordId(originRecord);
                new_ruleInfo.recorderID = originRecordId;
                await updateData(RewriteModel, {id: new_ruleInfo.id}, new_ruleInfo); 
            }
            break;
        }
        case RuleTypeMap.REMOTE:{
            let new_ruleInfo =  web2RemoteFormat(info.ruleInfo);
            if(info.ruleInfo.id === null){
                new_ruleInfo.recorderID = originRecordId;
                await RemoteModel.create(new_ruleInfo);
            }else{
                new_ruleInfo.recorderID = originRecordId;
                new_ruleInfo.id = info.ruleInfo.id;
                await updateData(RemoteModel, {id: new_ruleInfo.id}, new_ruleInfo); 
            }
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

/**
 * 查找record的id，如果record不存在，就insert然后返回id
 * @param {*} originRecord 
 */
async function getOriginRecordId(originRecord){
    delete originRecord.id;
    let path = originRecord.path;
    if(originRecord.method==='GET'){
        path = path.split('?')[0];
    }
    originRecord.relativePath = path;
    let query = {
        host: originRecord.host,
        relativePath: originRecord.relativePath
    };
    // let result = await OriginRecordModel.findOrCreate({
    //     where: query
    // });
    let result =  await findData(OriginRecordModel, query);
    if(result.length){
        return result[0].id;
    }
    result = await OriginRecordModel.create(originRecord);
    return result.id;
}



/**
 * 返回请求列表中某个请求匹配的所有代理规则列表
 * @param {*} query 查询条件：object{reqType：int，urlHost：str}
 */
async function fetchRuleList(query){
    let result = {};
    result[ProxyRecordTypeMap.REWRITE] = await getRewriteRuleList(query);
    result[ProxyRecordTypeMap.REMOTE] = await getRemoteRuleList(query);
    result[ProxyRecordTypeMap.LOCAL_MAP] = [];
    return result;

}

async function getRewriteRuleList(query){
    let rewriteList = await RewriteModel.findAll({
        where:{
            // isReqData: query.reqType,
            urlDomain: query.urlHost
        }
    });
    let newRuleList = [];
    for(let obj of rewriteList){
        if(matchUrl(query.urlPath, obj)){
            let new_obj = {
                name: obj.id,
                dataId: obj.id,
                disabled: false, //obj.isDelete
                ruleInfo:  server2webFormat(obj)
            }
            newRuleList.push(new_obj);
        }
    }
    return newRuleList;
}

async function getRemoteRuleList(query){
    let rewriteList = await RemoteModel.findAll({
        where:{
            // isReqData: query.reqType,
            urlDomain: query.urlHost
        }
    });
    let newRuleList = [];
    for(let obj of rewriteList){
        if(matchUrl(query.urlPath, obj)){
            let new_obj = {
                name: obj.id,
                dataId: obj.id,
                disabled: false, //obj.isDelete
                ruleInfo:  remote2WebFormat(obj)
            }
            newRuleList.push(new_obj);
        }
    }
    return newRuleList;
}

function web2RemoteFormat(obj){
    let new_obj = {
        urlDomain: obj.urlDomain,
        reqUrl: obj.reqUrl,
        targetUrl: obj.remoteUrl,
        isDelete: obj.isDelete === 'yes' ? true: false,
        createTime: obj.createTime,
        modifyTime: obj.modifyTime,
        addUser: obj.addUser,
        isLimitIP:  obj.isLimitIP === 'yes' ? true: false,
        IP: obj.IP,
    };
    return new_obj;
}

function remote2WebFormat(obj){
    obj.isGlobal = 'no';
    obj.isDelete = obj.isDelete ? 'yes' : 'no';
    obj.isLimitIP = obj.isLimitIP ? 'yes' : 'no';
    const defaultBaseConfig = {req:[{key:0,regexUrl:'', isGolbal:'no', isDisable:'no', isIpLimit:'no', ipList:'', remoteUrl:'', tableType:ItemTableMap.TABLE_BASE}],
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
        remoteUrl: obj.targetUrl || '',
        tableType: ItemTableMap.TABLE_BASE,
    };
    defaultBaseConfig.req[0] = o1;
    return {
        baseConfig: defaultBaseConfig,
        headersItem: headersItem,
        bodyItem: bodyItem
    }
}

/**
 * 页面返回的代理数据转换成rewriteModel对应的对象
 * @param {*} obj 
 */
function web2serverFormat(obj){
    let new_obj = Object.assign({}, obj);
    new_obj.isGlobal = obj.isGlobal==='yes'? true: false;
    new_obj.isDelete = obj.isDelete==='yes'? true: false;
    new_obj.isLimitIP = obj.isLimitIP==='yes'? true: false;
    new_obj.originHeaderParam = headerParam2server(obj.originHeaderParam, 'beforeData');
    new_obj.targetHeaderParam =  headerParam2server(obj.targetHeaderParam, 'afterData');
    new_obj.originBody = bodyParam2server(obj.originBody, obj.method, obj.isReqData, 'beforeData');
    new_obj.targetBody = bodyParam2server(obj.originBody, obj.method, obj.isReqData, 'afterData');
    return new_obj; 
}

/**
 * rewriteModel数据对象转换成页面中代理规则数据格式
 * @param {*} obj 
 */
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
    if(obj.isReqData){
        defaultBaseConfig.req[0] = o1;
        headersItem.req = server2headerParam(obj.originHeaderParam, obj.targetHeaderParam);
        bodyItem.req = server2BodyParam(obj.method, obj.isReqData, obj.originBody, obj.targetBody);
    }else{
        defaultBaseConfig.res[0] = o1;
        headersItem.res = server2headerParam(obj.originHeaderParam, obj.targetHeaderParam);
        bodyItem.res = server2BodyParam(obj.method, obj.isReqData, obj.originBody, obj.targetBody);
    }
    return {
        baseConfig: defaultBaseConfig,
        headersItem: headersItem,
        bodyItem: bodyItem
    }
}
/**
 * 请求头数据：页面格式转化成rewrite 指定数据格式
 * @param {*} headersList 
 * @param {*} dataIndex 
 */
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

/**
 * 请求头：服务端转化成页面数据格式
 * @param {*} oriHeadersListStr 
 * @param {*} targetHeadersListStr 
 */
function server2headerParam(oriHeadersList,targetHeadersList){// dataIndex:befroeData/afterData
    if((oriHeadersList=='' || oriHeadersList === null) && (targetHeadersList ==='' || targetHeadersList === null)) return [];
    // if(!oriHeadersListStr || oriHeadersListStr === '' || oriHeadersListStr === '[]') return [];
    // let oriHeadersList = JSON.parse(oriHeadersListStr);
    // let targetHeadersList = JSON.parse(targetHeadersListStr);
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
            newData.beforeData = filed+' : '+item[filed];
            newData.afterData = filed+' : '+target_obj[filed];
        }else{
            newData.headerType = HeaderOperationMap.DELETE;
            newData.headerName = filed;
            newData.beforeData = filed+' : '+item[filed];
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
            newData.afterData = filed+' : '+item[filed];
            newIndex++;
            return newData;
        }
    }).filter(item => item!= void 0 );;
    return [...arr1,...arr2];
}

function server2BodyParam(method, reqType, oriBodyStr, targerBodyStr){
    if(oriBodyStr==='' || oriBodyStr === null) return [];
    let newIndex = 0;
    if(method==='GET' && reqType){
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
                newData.beforeData = filed+ ' = ' + item[filed];
                newData.afterData = filed + ' = ' + target_obj[filed];
                newIndex++;
                return newData;
            }
        });
        return arr;
    }else{
        let ori_arr = oriBodyStr.split("&&");
        let target_arr = targerBodyStr.split('&&');
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
      return arr.join('&&');
    }
}

async function saveHttpsConfig(obj){
    if(obj.urlDomain.includes('https')){
        let result = await HttpsConfigModel.findAll({
            where:{
                domain: obj.urlDomain
            }
        });
        if(result.length){
            return;
        }
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
const matchUrl= (ori_req_url, obj) =>{
    let i_req_url = obj.reqUrl;
    let r1 = new RegExp('\\*','ig');
    i_req_url = i_req_url.replace(r1,'.*');
    var re = new RegExp(i_req_url,'ig');
    if(re.test(ori_req_url)) return true;
    return false;
}
async function test(){
    // let query = {
    //     reqType: 1,
    //     urlHost: 'www.acar168.cn:5509',
    //     urlPath: '/staff-client-interfaces/m/system/login/2_5_5',
    // };
    // let result = await fetchRuleList(query);
    // console.log(result);
    let data = {id:13,isDelete: 0,method: 'POST'};
    await updateData(RewriteModel,{id: data.id}, data);

};

// test();

module.exports = {
    saveRuleInfo,
    fetchRuleList
}
