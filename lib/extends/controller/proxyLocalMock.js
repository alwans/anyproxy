'use strict'

exports.res_mock_handler = function(requestDetail,sql_result){
    const localResponse = {
        statusCode: 200,
        header: { 'Content-Type': 'application/json' },
        body: sql_result.localRes
      };
    //   Buffer.from(sql_result.localRes,'utf-8');
    return {
        response:localResponse
    };;
}