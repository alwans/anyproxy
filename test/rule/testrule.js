


module.exports = {
    summary:'是否需要解析 https',
    *beforeDealHttpsRequest(requestDetail){
    },
    summary:'before req',
    *beforeSendRequest(requestDetail){


    },
    summary: 'a rule to hack response',
    *beforeSendResponse(requestDetail, responseDetail) {
    },
};
