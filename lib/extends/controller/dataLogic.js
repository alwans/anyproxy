'use strict'

const {RewriteModel} = require('../data/model/rewriteModel');
const {HttpsConfigModel} =  require('../data/model/httpsConfigModel');
const { OriginRecordModel } = require('../data/model/originRecordModel');
const { ItemTableMap, HeaderOperationMap, ProxyRecordTypeMap } = require('../common/constant');
const {updateData, findData} = require('../data/dataUtils');

const datacore = require('./data.js'),
{rewrite_handler} = require('./proxyRewrite.js'),
{remote_handler} = require('./proxyRemote.js'),
{res_mock_handler} = require('./proxyLocalMock.js');

const req_type = {
    rewrite: 0,
    remote: 1,
    local_mock: 2
}


/**
 * 判断是否需要解析https
 * @param {*} requestDetail 
 */
const isDealHttps = async (requestDetail) =>{
    let isDeal = false;
    let query = {
        isDelete: false,
        domain: requestDetail.host.split(":")[0]
    };
    let result = await findData(HttpsConfigModel, query);
    if(result.length){
        isDeal = !!true;
    }
    return isDeal;
}

/**
 * 匹配请求地址和数据库中的拦截信息是否相同
 * @param {str} ori_req_url 拦截的请求地址
 * @param {sql_result_item} obj 数据库中的数据
 */
const matchUrl= (ori_req_url,obj) =>{
    if(!ori_req_url.toUpperCase().includes(obj.urlDomain.toUpperCase())) return false; //如果不是同一个domain，就直接返回false
    let i_req_url = obj.reqUrl;
    let r1 = new RegExp('\\*','ig');
    i_req_url = i_req_url.replace(r1,'.*');
    var re = new RegExp(i_req_url,'ig');
    if(re.test(ori_req_url)) return true;
    return false;
}


const switchReqType = async (requestDetail, sqls)=>{
    

    for(let i=0;i<sqls.length;i++){
        let result = await datacore.query(sqls[i]);
        if(result !== void 0 && result.length >0){
            for(let ii=0;ii<result.length;ii++){
                if(matchUrl(requestDetail.url,result[ii])){
                    return {
                        id: i,
                        sql_result: result[ii]
                    }
                }
            }
        }
    }
    return -1;
}

/**
 * 处理请求信息：rewrite，remote，local_mock
 * @param {} requestDetail 
 * @param {} remoteIP
 */
 const resolveRequest = async (requestDetail,remoteIP) =>{
    let req_domain = requestDetail.url.split('/')[2];
    const sqls = [];
    sqls.push(`select * from t_proxy_rewrite  where urlDomain = '${req_domain}' and isReqData=1 and isDelete=0 and IF(IFNULL(isLimitIP,0)=0,1=1,IP='${remoteIP}')`);//rewrite
    sqls.push(`select * from t_proxy_remote  where urlDomain = '${req_domain}'  and isDelete=0 and IF(IFNULL(isLimitIP,0)=0,1=1,IP='${remoteIP}')`);//remote
    sqls.push(`select * from t_proxy_localMock  where urlDomain = '${req_domain}'  and isDelete=0 and IF(IFNULL(isLimitIP,0)=0,1=1,IP='${remoteIP}')`);//localmock
    let type = await switchReqType(requestDetail, sqls);
    if(type===-1) return(requestDetail);
    switch(type.id){
        case req_type.rewrite:{
            rewrite_handler(requestDetail,type.sql_result);
            break;
        }       
        case req_type.remote:{
            remote_handler(requestDetail,type.sql_result);
            break;
        }
        case req_type.local_mock:{
            requestDetail = res_mock_handler(requestDetail,type.sql_result);
            break;
        }
    }
    console.log('requestDetail---2 = ',requestDetail);
    return requestDetail;
 
 }

 const resolveResponse = async(requestDetail,responseDetail,remoteIP) =>{
    let req_domain = requestDetail.url.split('/')[2];
    const sqls = [];
    sqls.push(`select * from t_proxy_rewrite  where urlDomain = '${req_domain}' and isReqData=0 and isDelete=0 and IF(IFNULL(isLimitIP,0)=0,1=1,IP='${remoteIP}')`);//rewrite
    // sqls.push(`select * from t_proxy_remote  where urlDomain = '${req_domain}'  and isDelete=0 and IF(IFNULL(isLimitIP,0)=0,1=1,IP='${remoteIP}')`);//remote
    // sqls.push(`select * from t_proxy_localMock  where urlDomain = '${req_domain}'  and isDelete=0 and IF(IFNULL(isLimitIP,0)=0,1=1,IP='${remoteIP}')`);//localmock
    let type = await switchReqType(requestDetail,sqls);
    if(type===-1) return responseDetail;
    switch(type.id){
        case req_type.rewrite:{
            rewrite_handler(requestDetail,type.sql_result,responseDetail);
            break;
        }
        // case req_type.remote:{
        //     remote_handler(requestDetail,type.sql_result);
        //     break;
        // }
        // case req_type.local_mock:{
        //     res_mock_handler(responseDetail,type.sql_result);
        //     break;
        // }
    }
    return responseDetail;
 }

// isDealHttps();
// resolveRequest();
// switchReqType();

module.exports={
    isDealHttps,
    resolveRequest,
    resolveResponse
}
