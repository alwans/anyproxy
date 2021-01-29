const dataLogic =  require('../controller/dataLogic.js')
const {urlDecode} = require('../utils/utils');
const exec = require('child_process').exec;
const crtMgr = require('../../certMgr.js');

module.exports = {
    summary:'是否需要解析 https',
    *beforeDealHttpsRequest(requestDetail){
        if(dataLogic.isDealHttps(requestDetail)){
            if (!crtMgr.ifRootCAFileExists()) {
                crtMgr.generateRootCA((error, keyPath) => {
                    // let users to trust this CA before using proxy
                    if (!error) {
                    const certDir = require('path').dirname(keyPath);
                    console.log('The cert is generated at', certDir);
                    const isWin = /^win/.test(process.platform);
                    if (isWin) {
                        exec('start .', { cwd: certDir });
                    } else {
                        exec('open .', { cwd: certDir });
                    }
                    } else {
                    console.error('error when generating rootCA', error);
                    }
                });
            }
        }
        return dataLogic.isDealHttps(requestDetail);
    },
    summary:'before req',
    *beforeSendRequest(requestDetail){
        const remoteIP = requestDetail._req.client.remoteAddress.split(':').pop();
        return new Promise(async (resolve,reject) =>{
            let obj  =await  dataLogic.resolveRequest(requestDetail,remoteIP);
            resolve(obj);
        });
    },
    summary: 'a rule to hack response',
    *beforeSendResponse(requestDetail, responseDetail) {
        const remoteIP = requestDetail._req.client.remoteAddress.split(':').pop();
        return new Promise(async (resolve,reject) =>{
            let obj = await dataLogic.resolveResponse(requestDetail, responseDetail, remoteIP);
            resolve(obj);
        });
    },
};
