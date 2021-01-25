export const FETCH_REQUEST_LOG = 'FETCH_REQUEST_LOG';
export const UPDATE_WHOLE_REQUEST = 'UPDATE_WHOLE_REQUEST';
export const UPDATE_SINGLE_RECORD = 'UPDATE_SINGLE_RECORD';
export const CLEAR_ALL_RECORD = 'CLEAR_ALL_RECORD';
export const CLEAR_ALL_LOCAL_RECORD = 'CLEAR_ALL_LOCAL_RECORD';
export const FETCH_RECORD_DETAIL = 'FETCH_RECORD_DETAIL';
export const SHOW_RECORD_DETAIL = 'SHOW_RECORD_DETAIL';
export const HIDE_RECORD_DETAIL = 'HIDE_RECORD_DETAIL';
export const UPDATE_MULTIPLE_RECORDS = 'UPDATE_MULTIPLE_RECORDS';
//新增---wl
export const FETCH_PROXY_RULE_LIST = 'FETCH_PROXY_RULE_LIST'; 
export const SAVE_PROXY_RULE_INFO = 'SAVE_PROXY_RULE_INFO';
export const DELETE_PROXY_RULE_INFO = 'DELETE_PROXY_RULE_INFO';
export const UPDATE_PROXY_RULE_LIST = 'UPDATE_PROXY_RULE_LIST';

export function fetchRequestLog() {
    return {
        type: FETCH_REQUEST_LOG
    };
}

export function updateWholeRequest(data) {
    return {
        type: UPDATE_WHOLE_REQUEST,
        data: data
    };
}

export function updateRecord(record) {
    return {
        type: UPDATE_SINGLE_RECORD,
        data: record
    };
}

export function clearAllRecord () {
    return {
        type: CLEAR_ALL_RECORD
    };
}

export function clearAllLocalRecord () {
    return {
        type: CLEAR_ALL_LOCAL_RECORD
    };
}

export function fetchRecordDetail (recordId) {
    return {
        type: FETCH_RECORD_DETAIL,
        data: recordId
    };
}

export function showRecordDetail (record) {
    return  {
        type: SHOW_RECORD_DETAIL,
        data: record
    };
}

export function hideRecordDetail () {
    return {
        type: HIDE_RECORD_DETAIL
    };
}

export function updateMultipleRecords (records) {
    return {
        type: UPDATE_MULTIPLE_RECORDS,
        data: records
    };
}

//新增----wl
export function saveProxyRuleInfo(ruleObj){
    return {
        type: SAVE_PROXY_RULE_INFO,
        data: ruleObj
    }
}

export function fetchProxyRuleList(reqType,urlHost,urlPath){  //reqType: req:1 | res:0 
    let params = {
        reqType: reqType,
        urlHost: urlHost,
        urlPath: urlPath
    };
    return {
        type: FETCH_PROXY_RULE_LIST,
        data: params
    }
}

export function updateProxyRuleList(proxyRuleList){
    return {
        type: UPDATE_PROXY_RULE_LIST,
        data: proxyRuleList
    }
}

export function deleteProxyRuleInfo(ruleId){
    return {
        type: DELETE_PROXY_RULE_INFO,
        data: ruleId
    }
}
