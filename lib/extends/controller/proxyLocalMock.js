'use strict'

exports.res_mock_handler = function(requestDetail, ruleObj){
    const localResponse = {
        statusCode: 200,
        header: { 'Content-Type': 'application/json' },
        body: ruleObj.localRes
      };
    //   Buffer.from(ruleObj.localRes,'utf-8');
    return {
        response:localResponse
    };;
}