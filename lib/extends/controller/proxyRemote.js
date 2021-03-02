'use strict'


exports.remote_handler = function(requestDetail, ruleObj){
    let remote_url = ruleObj.targetUrl;
    if(remote_url.includes('http')){
        requestDetail.protocol = remote_url.split('://')[0];
        remote_url = remote_url.split('://')[1];
    }
    if(remote_url.includes(':')){
        requestDetail.requestOptions.hostname=remote_url.split(':')[0];
        remote_url = remote_url.split(':')[1];
        if(remote_url.includes('/')){
            requestDetail.requestOptions.port = remote_url.split('/')[0];
            requestDetail.requestOptions.path = remote_url.replace(remote_url.split('/')[0],'');
        }else{
            requestDetail.requestOptions.port = remote_url;
        }
    }else{
        requestDetail.requestOptions.hostname=remote_url;
        requestDetail.requestOptions.port = '';
        requestDetail.requestOptions.path = '';
    }
}