'use strict'
const urlencode = require('urlencode');


exports.urlDecode = function(str,charset_str){
    return urlencode.decode(str,charset_str);
}
exports.urlEncode = function(str,charset_str){
    return urlencode.encode(str,charset_str);
}