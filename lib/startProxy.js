const {ProxyServer} = require('../proxy');


const options = {
  port: 8001,
  rule: require('./extends/rule/proxyRules.js'),
  webInterface: {
    enable: true,
    webPort: 8002
  },
  throttle: 10000,
  forceProxyHttps: false,
  wsIntercept: true, // 不开启websocket代理
  silent: false
};
const proxyServer = new ProxyServer(options);

proxyServer.on('ready', () => { 
    console.log('start proxy...');
 });
proxyServer.on('error', (e) => { 
    console.log(e);
 });
proxyServer.start();

//when finished5
// proxyServer.close();