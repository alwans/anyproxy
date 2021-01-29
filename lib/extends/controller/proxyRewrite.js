'use strict'
const {urlDecode,urlEncode} = require('../utils/utils');

var isMathValue = false;

/**
 * 重写逻辑入口
 * @param {*} requestDetail 原始请求数据
 * @param {*} ruleObj 接口修改信息
 */
 exports.rewrite_handler = function(requestDetail, ruleObj, responseDetail){
    filter_ruleObj(ruleObj); // format ruleObj
    if(ruleObj.originHeaderParam !== null || ruleObj.targetHeaderParam !== null){
        header_handler(requestDetail, ruleObj, responseDetail);
    }
    if( ruleObj.originBody !== '' || ruleObj.targetBody !== '' || ruleObj.httpStatusCode != ''){
        if(ruleObj.isReqData){
            req_body_handler(requestDetail, ruleObj);
        }else{
            res_body_handler(ruleObj, responseDetail);
        }
    }
 }
 
 
 /**
  * 请求头逻辑入口
  * @param {*} requestDetail 原始请求数据
  * @param {*} ruleObj 接口对应的信息
  * @param {*} responseDetail 响应数据
  */
 const header_handler = function(requestDetail, ruleObj, responseDetail){
    let arr1 = ruleObj.originHeaderParam || [];
    let arr2 = ruleObj.targetHeaderParam || [];
    let isReqData = ruleObj.isReqData;
    arr1.map((obj) => {
        let r = isExist(obj,arr2);
        if(r.flag){
            let index = arr2.indexOf(r.obj)
            arr2.splice(index, 1);
            header_modify(requestDetail, obj, r.obj, isReqData);
        }else{
            header_remove(requestDetail, obj, isReqData);
        }
    });
    arr2.map((obj) => {
        header_add(requestDetail, obj, isReqData);
    });
 }

/**
 * 修改响应数据
 * @param {*} ruleObj 修改相关信息
 * @param {*} responseDetail 原始响应数据
 */
 function res_body_handler(ruleObj,responseDetail){
    // let str = urlDecode(responseDetail.response.body.toString('utf-8'),'utf-8');
    let str = responseDetail.response.body.toString('utf-8');
    // let r1 = new RegExp(v,'ig');
    // str = str.replace(/\s+/g, ""); //去掉请求数据中的空格
    let pre_arr = ruleObj.originBody ===''? []: ruleObj.originBody.replace(/\s+/g, "").split('&&'); //去掉空格
    let target_arr = ruleObj.targetBody===''? []: ruleObj.targetBody.replace(/\s+/g, "").split('&&');//去掉空格
    if(ruleObj.httpStatusCode !== null){
        responseDetail.response.statusCode = ruleObj.httpStatusCode;
        // return responseDetail;
    }
    pre_arr.map((v,num) =>{
        if(!ruleObj.isGlobal || ruleObj.isGlobal === ''){
            let re = new RegExp(v,'i');
            str = str.replace(re, target_arr[num]);
            // str = str.replace(v,target_arr[num]);
        }else{
            let re = new RegExp(v,'ig');
            str = str.replace(re, target_arr[num]);
        }
    });
    responseDetail.response.body = Buffer.from(str,'utf-8');
    console.log(responseDetail.response.body.toString('utf-8'));
 }

 /**
  * req body 逻辑入口
  * @param {*} requestDetail 
  * @param {*} ruleObj 
  */
 const req_body_handler = function(requestDetail,ruleObj){
    if(requestDetail.requestOptions.method==='GET'){
        req_get_body_handler(requestDetail,ruleObj);
    }else{
        req_post_body_handler(requestDetail,ruleObj);
    }
 }

 /**
  * post请求body修改
  * @param {*} requestDetail 
  * @param {*} ruleObj 
  */
const req_post_body_handler = function(requestDetail,ruleObj){
    let str = urlDecode(requestDetail.requestData.toString('utf-8'),'utf-8');
    // let str = requestDetail.requestData.toString('utf-8');
    // str = urlDecode(str,'utf-8');
    let pre_arr = ruleObj.originBody===''? []: ruleObj.originBody.split('&&');
    let target_arr = ruleObj.targetBody===''? [] : ruleObj.targetBody.split('&&');
    if(pre_arr.length!=target_arr.length) return requestDetail;
    pre_arr.map((v,num) =>{
        if(ruleObj.isGlobal===0 || ruleObj.isGlobal === ''){
            let re = new RegExp(v,'i');
            str = str.replace(re,target_arr[num]);
        }else{
            let re = new RegExp(v,'ig');
            str = str.replace(re,target_arr[num]);
        }
    });
    // str = urlEncode(str,'utf-8');
    requestDetail.requestData = Buffer.from(str,"utf-8");
    // console.log(urlDecode(requestDetail.requestData.toString('utf-8'),'utf-8'));
}

/**
 * get方法的body修改
 * @param {*} requestDetail 
 * @param {*} ruleObj 
 */
 const req_get_body_handler = function(requestDetail,ruleObj){
    let pre_arr = JSON.parse(ruleObj.originBody || '[]');
    let target_arr = JSON.parse(ruleObj.targetBody || '[]');
    let param_key=[];
    let param_value=[];
    requestDetail.url.split('?')[1].split('&').map((p) => {
        param_key.push(p.split('=')[0]);
        param_value.push(p.split('=')[1]);
    });
    pre_arr.map((obj) =>{
        let r = isExist(obj,target_arr);
        if(r.flag){
            param_value = get_body_modify(param_key,param_value,target_arr,obj,r);
        }else{
            param_value = get_body_remove(param_key,param_value,obj,r);
        }
    });
    target_arr.map((obj) => { // for add body params
        let filed = Object.keys(obj)[0];
        param_key.push(filed);
        param_value.push(obj[filed]);
    });
    let new_param_str = '';
    param_key.map((k,num) =>{
        new_param_str = new_param_str+k+'='+ param_value[num]+'&'
    });
    new_param_str = new_param_str.substring(0,new_param_str.length-1);
    let new_url = requestDetail.url.split('?')[0]+'?'+new_param_str;
    requestDetail.requestOptions.path = requestDetail.requestOptions.path.split('?')[0]+'?'+new_param_str;
    requestDetail.url = new_url;
    requestDetail._req.url = new_url;
 }

/**
 * 删除get的请求中指定的k=v
 * @param {*} param_key 
 * @param {*} param_value 
 * @param {*} pre_obj 
 * @param {*} r 
 */
 const get_body_remove = function(param_key,param_value,pre_obj,r){
    if(param_key.includes(r.filed)){
        let n1 = param_key.indexOf(r.filed);
        if(isMathValue && pre_obj[r.filed] !== param_value[n1]) return param_value; //math value is equal
        param_value.splice(n1,1);
    }else{
        console.log(`${filed} is not exist, this param remove failed ...!!!`);
    }
    return param_value;
 }

/**
 * 修改get请求中指定key对应的value
 * @param {*} param_key 
 * @param {*} param_value 
 * @param {*} target_arr 
 * @param {*} pre_obj 
 * @param {*} r 
 */
 const get_body_modify = function(param_key,param_value,target_arr,pre_obj,r){
    let index = target_arr.indexOf(r.obj);
    target_arr.splice(index,1);
    if(param_key.includes(r.filed)){
        let n1 = param_key.indexOf(r.filed);
        if(isMathValue && pre_obj[r.filed] !== param_value[n1]) return param_value; //math value is equal
        param_value[n1] = r.obj[r.filed];
    }else{
        console.log(`${filed} is not exist, this param modify failed ...!!!`);
    }
    return param_value;
 }

 /**
  * 新增请求头
  * @param {*} requestDetail 
  * @param {sql_obj} obj 
  */
 const header_add = function(requestDetail, obj, isReqData){
    let filed = Object.keys(obj)[0];
    if(isReqData){
        requestDetail.requestOptions.headers[filed] = obj.filed;
    }else{
        requestDetail.response.header[filed] = obj.filed;
    }
 }
 /**
  * 修改请求头
  * @param {*} requestDetail 
  * @param {*} pre_obj 请求头原始数据
  * @param {*} target_obj 请求头需要修改后的数据
  */
 const header_modify = function(requestDetail, pre_obj, target_obj, isReqDate){
    let filed = Object.keys(pre_obj)[0];
    if(isReqDate){
        requestDetail.requestOptions.headers[filed] = target_obj[filed];
    }else{
        requestDetail.response.header[filed] = target_obj[filed];
    }
 }
/**
 * 删除请求头
 * @param {*} requestDetail 
 * @param {*} obj 
 */
 const header_remove = function(requestDetail, obj, isReqData){
    let filed = Object.keys(obj)[0];
    if(isReqData){
        delete requestDetail.requestOptions.headers[filed]
    }else{
        delete requestDetail.response.header[filed];
    }
 }

/**
 * 对用的请求头中的key是否存在
 * @param {*} obj 
 * @param {*} objs 
 */
 const isExist = function(obj,objs){
    // objs.hasOwnProperty(obj);
    let filed = Object.keys(obj)[0];
    let flag = false;
    let target_obj = '';
    objs.some(v => {
        let f = Object.keys(v)[0];
        if(f===filed){
            flag = true;
            target_obj = v;
            return true;
        }
    });
    return {
        flag:flag,
        obj:target_obj,
        filed:filed
    };
}

/**
 * format ruleObj , if v=null || '', then set v=''
 * @param {*} ruleObj 
 */
const filter_ruleObj = function(ruleObj){
    for(let k in ruleObj){
        ruleObj[k] = ruleObj[k] || '';
    }
}