/**
 * The panel to display the detial of the record
 *
 */

import React, { PropTypes } from 'react';
import ClassBind from 'classnames/bind';
import { Menu, Dropdown,Spin,notification,message,Button,Select,Tag } from 'antd';
import ModalPanel from 'component/modal-panel';
import RecordRequestDetail from 'component/record-request-detail';
import RecordResponseDetail from 'component/record-response-detail';
import RecordWsMessageDetail from 'component/record-ws-message-detail';
import { hideRecordDetail, saveProxyRuleInfo, fetchProxyRuleList } from 'action/recordAction';

import Style from './record-detail.less';

const Option = Select.Option;
const StyleBind = ClassBind.bind(Style);
const PageIndexMap = {
  REQUEST_INDEX: 'REQUEST_INDEX',
  RESPONSE_INDEX: 'RESPONSE_INDEX',
  WEBSOCKET_INDEX: 'WEBSOCKET_INDEX'
};
const ProxyRecordTypeMap = {
  REWRITE:'REWRITE',
  LOCAL_MAP:'LOCAL_MAP',
  REMOTE:'REMOTE'
};
const ItemTableMap = {
  TABLE_HEADER:"TABLE_HEADER",
  TABLE_BODY:"TABLE_BODY",
  TABLE_BASE:"TABLE_BASE"
}

const HeaderOperationMap ={
  UPDATE:'UPDATE',
  ADD:'ADD',
  DELETE:'DELETE'
}

const Test_proxyList = {
  REWRITE:[{name:'rewire_1',disabled:true},{name:'rewire_2',disabled:false},{name:'rewire_3',disabled:false}],
  // LOCAL_MAP:[{name:'localMap_1'},{name:'localMap_2'},{name:'localMap_3'}],
  LOCAL_MAP:[],
  REMOTE:[{name:'remote_1',disabled:false},{name:'remote_2',disabled:true},{name:'remote_3',disabled:false}]
};

const defaultBaseConfig = {req:[{key:0,regexUrl:'',isGolbal:'no',isDisable:'no',isIpLimit:'no',ipList:'',remoteUrl:'',tableType:ItemTableMap.TABLE_BASE}],
                           res:[{key:0,regexUrl:'',isGolbal:'no',isDisable:'no',isIpLimit:'no',ipList:'',remoteUrl:'',tableType:ItemTableMap.TABLE_BASE}]};

class RecordDetail extends React.Component {
  constructor() {
    super();
    this.onClose = this.onClose.bind(this);
    this.state = {
      pageIndex: PageIndexMap.REQUEST_INDEX,
      isEdit: false,  // page can be edited
      editType: ProxyRecordTypeMap.REWRITE,
      originRecord: null,  //origin or Before modification record detail
      editRecordDetail: null, //modified record detail
      bodyItem: {req:[],res:[]},   //obj-keys:[tableType,beforData,afterData,isDelete]
      headersItem: {req:[],res:[]},  //obj-keys:[tableType,headerName,beforeData,afterData,isDelete]
      baseConfig: defaultBaseConfig,
      ruleInfo_id: null,
    };
    this.onSave = this.onSave.bind(this); 
    this.onEdit = this.onEdit.bind(this); 
    this.onMenuChange = this.onMenuChange.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.tableHandleDelete = this.tableHandleDelete.bind(this);
    this.tableHandleCellChange = this.tableHandleCellChange.bind(this);
    this.tabelHandleAdd = this.tabelHandleAdd.bind(this);
  }

  static propTypes = {
    dispatch: PropTypes.func,
    globalStatus: PropTypes.object,
    requestRecord: PropTypes.object
  }
  onSave(){
    if(!this.state.isEdit){
      this.notify('请先编辑', 'error')
      return ;
    }else{
      let flag = true;
      if(this.state.editType === ProxyRecordTypeMap.REWRITE){
        if(JSON.stringify(this.state.headersItem) === '{"req":[],"res":[]}' && 
            JSON.stringify(this.state.bodyItem) === '{"req":[],"res":[]}'){

              this.notify('请编辑内容后再点击保存', 'error')
              return ;
        }

      }else if(this.state.editType === ProxyRecordTypeMap.REMOTE){
        this.state.baseConfig.req[0].remoteUrl==='' || this.state.baseConfig.res[0].remoteUrl==='' ? flag = true : flag=false;
        if(flag){
          this.notify('请先编辑remoteUrl', 'error')
          return ;
        }
      }

    }
    let data = {
      id: this.state.ruleInfo_id,
      recorderID: null,
      method: this.props.requestRecord.recordDetail.method,
      urlDomain: this.props.requestRecord.recordDetail.host,
      headerType: null,
      headerEnum: null,
      httpStatusCode: null,
      bodyEnum: null,
      createTime: new Date().getTime(),
      modifyTime: new Date().getTime(),
      addUser: 'admin',
      remark: '',
    };
    let o1;
    if(this.state.pageIndex==PageIndexMap.REQUEST_INDEX){
      o1 = {
        isReqData: true,
        reqUrl: this.state.baseConfig.req[0].regexUrl,
        originHeaderParam: this.state.headersItem.req,
        targetHeaderParam: this.state.headersItem.req,
        originBody: this.state.bodyItem.req,
        targetBody: this.state.bodyItem.req,
        isGlobal: this.state.baseConfig.req[0].isGolbal,
        isDelete: this.state.baseConfig.req[0].isDisable,
        isLimitIP: this.state.baseConfig.req[0].isIpLimit,
        IP: this.state.baseConfig.req[0].ipList,
      };
    }else{
      o1 = {
        isReqData: false,
        reqUrl: this.state.baseConfig.res[0].regexUrl,
        originHeaderParam: this.state.headersItem.res,
        targetHeaderParam: this.state.headersItem.res,
        originBody: this.state.bodyItem.res,
        targetBody: this.state.bodyItem.res,
        isGlobal: this.state.baseConfig.res[0].isGolbal,
        isDelete: this.state.baseConfig.res[0].isDisable,
        isLimitIP: this.state.baseConfig.res[0].isIpLimit,
        IP: this.state.baseConfig.res[0].ipList,
      };
    }
    data = Object.assign(data,o1);
    console.log(data);
    this.notify('SAVE SUCCESS', 'success')
    let new_dafaultBaseConfig = JSON.parse(JSON.stringify(defaultBaseConfig))
    new_dafaultBaseConfig.req[0].regexUrl = this.props.requestRecord.recordDetail.path;
    new_dafaultBaseConfig.res[0].regexUrl = this.props.requestRecord.recordDetail.path;
    let ruleObj = {
      type: this.state.editType,
      ruleInfo: data,
      originRecord: this.state.originRecord
    };
    this.props.dispatch(saveProxyRuleInfo(ruleObj));
    setTimeout(() =>{ //保存还未成功，就获取结束了
      // this.props.dispatch(fetchProxyRuleList(data.isReqData, data.urlDomain, data.reqUrl)); 
    },500);
    this.setState({
      isEdit:false,
      editType:ProxyRecordTypeMap.REWRITE,
      baseConfig: new_dafaultBaseConfig,
    });
  }


  onEdit(e){ //edit btn -->onClick
    let new_dafaultBaseConfig = JSON.parse(JSON.stringify(defaultBaseConfig))
    new_dafaultBaseConfig.req[0].regexUrl = this.state.originRecord.path.split('?')[0];
    new_dafaultBaseConfig.res[0].regexUrl = this.state.originRecord.path.split('?')[0];
    this.setState({
      isEdit:true,
      editType:e.key,
      bodyItem: {req:[],res:[]},
      headersItem: {req:[],res:[]},
      baseConfig: new_dafaultBaseConfig,
      ruleInfo_id: null,
    });
  }
  globalNotify(msg){
    message.info(msg);
  }
  onClickItem(e){
    // console.log('-->click item');
    // console.log(e);
    // console.log(e.key);
    let new_editType = ProxyRecordTypeMap.REWRITE;
    const recordProxyRuleList = this.props.requestRecord.recordProxyRuleList;
    Object.keys(recordProxyRuleList).map(key =>{
      if(recordProxyRuleList[key].includes(e.item.props.data)){
        new_editType = key;
      }
    })
    let data = e.item.props.data;
    let ruleInfo = data.ruleInfo;
    if(this.state.pageIndex === PageIndexMap.RESPONSE_INDEX){
      if(!ruleInfo.headersItem.res.length && !ruleInfo.bodyItem.res.length){
        this.notify('该规则未设置响应信息处理，请切换请求页面查看', 'error')
        return ;
      }
    }else{
      if(!ruleInfo.headersItem.req.length && !ruleInfo.bodyItem.req.length && ruleInfo.baseConfig.req[0].remoteUrl===''){
        this.notify('该规则未设置请求信息处理，请切换响应页面查看', 'error')
        return ;
      }
    }
    // console.log(ruleInfo);
    this.setState({
      isEdit:true,
      editType: new_editType,
      bodyItem: {req:[],res:[]},   //obj-keys:[tableType,beforData,afterData,isDelete]
      headersItem: {req:[],res:[]},  //obj-keys:[tableType,headerName,beforeData,afterData,isDelete]
      baseConfig: {req:[],res:[]},
      ruleInfo_id: data.dataId,
    },function(){    //table渲染异常，所以每次更新前先清空所有table，然后通过回调再更新需要的table数据
      this.setState({
        isEdit:true,
        editType: new_editType,
        headersItem: ruleInfo.headersItem,
        bodyItem: ruleInfo.bodyItem,
        baseConfig: ruleInfo.baseConfig,
        ruleInfo_id: data.dataId,
      });
    });
  }

  tableHandleDelete(key,tableType){
    switch(tableType){
      case ItemTableMap.TABLE_HEADER:{
        let headersItem = Object.assign({},this.state.headersItem);
        headersItem = this.deleteHandle(key,headersItem);
        this.setState({
          headersItem: headersItem,
        });
        break;
      }
      case ItemTableMap.TABLE_BODY:{
        let bodyItem = Object.assign({},this.state.bodyItem);
        bodyItem = this.deleteHandle(key,bodyItem);
        this.setState({
          bodyItem: bodyItem,
        });
        break;
      }
      default:{}
    }
  };

  deleteHandle(key,dataItem){
    console.log('key--------->',key);
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        let dataSource = [...dataItem.req];
        dataSource = dataSource.filter((item) => item.key !== key);
        dataItem.req = dataSource;
        return dataItem;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        let dataSource = [...dataItem.res];
        dataSource = dataSource.filter((item) => item.key !== key);
        dataItem.res = dataSource;
        return dataItem;
      }
    }

  }

  getTargetList(dataItem){
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        return [...dataItem.req];
      }
      case PageIndexMap.RESPONSE_INDEX:{
        return [...dataItem.res];
      }
    }
  }

  tabelHandleAdd(tableType){
    switch(tableType){
      case ItemTableMap.TABLE_HEADER:{
        let headersItem = Object.assign({},this.state.headersItem);
        headersItem = this.addHeaderHandle(headersItem);
        this.setState({
          headersItem: headersItem,
        });
        break;
      }
      case ItemTableMap.TABLE_BODY:{
        let bodyItem = Object.assign({},this.state.bodyItem);
        bodyItem = this.addBodyHanle(bodyItem);
        console.log(bodyItem);
        this.setState({
          bodyItem: bodyItem,
        });
        break;
      }
      default:{}
    }
  };

  addHeaderHandle(dataItem){
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        let dataSource = [...dataItem.req];
        dataItem.req = [...dataSource, this.addHeaderItem(dataSource)]
        return dataItem;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        let dataSource = [...dataItem.res];
        dataItem.res = [...dataSource, this.addHeaderItem(dataSource)]
        return dataItem;
      }
    }
  }

  addHeaderItem(dataSource){
    let newIndex = dataSource.length==0?1: dataSource.slice(-1)[0].key+1;
    const newData = {
      key: newIndex,
      tableType:ItemTableMap.TABLE_HEADER,
      headerType: HeaderOperationMap.UPDATE,
      headerName:'',
      beforeData: '',
      afterData: '',
      isDelete: false,
    };
    return newData;
  }

  addBodyHanle(dataItem){
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        let dataSource = [...dataItem.req];
        dataItem.req = [...dataSource, this.addBodyItem(dataSource)]
        return dataItem;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        let dataSource = [...dataItem.res];
        dataItem.res = [...dataSource, this.addBodyItem(dataSource)]
        return dataItem;
      }
    }
  }
  addBodyItem(dataSource){
    let newIndex = dataSource.length==0?1: dataSource.slice(-1)[0].key+1;
    const newData = {
      key: newIndex,
      tableType:ItemTableMap.TABLE_BODY,
      beforeData: '',
      afterData: '',
      isDelete: false,
    };
    return newData;
  }

  tableHandleCellChange(key, dataIndex,tableType){
    // console.log(`----111---->key:${key}, dataIndex:${dataIndex}, tableType:${tableType}`);
    return (value) =>{
      switch(tableType){
        case ItemTableMap.TABLE_HEADER:{
          let headersItem = Object.assign({},this.state.headersItem);
          headersItem = this.cellHandle(key,dataIndex,headersItem,value);
          this.setState({
            headersItem:headersItem
          });
          break;
        }
        case ItemTableMap.TABLE_BODY:{
          let bodyItem = Object.assign({},this.state.bodyItem);
          bodyItem = this.cellHandle(key,dataIndex,bodyItem,value);
          this.setState({
            bodyItem:bodyItem
          });
          break;
        }
        case ItemTableMap.TABLE_BASE:{
          let baseConfig = Object.assign({},this.state.baseConfig);
          baseConfig =  this.cellHandle(key,dataIndex,baseConfig,value);
          this.setState({
            baseConfig: baseConfig
          });
          break;
        }
      }
    }
  };

  cellHandle(key,dataIndex,dataItem,value){
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        let newData = [...dataItem.req];
        const target = newData.find(item => item.key === key);
        if(target){
          target[dataIndex] = value;
          dataItem.req = [...newData]
        }
        return dataItem;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        let newData = [...dataItem.res];
        const target = newData.find(item => item.key === key);
        if(target){
          target[dataIndex] = value;
          dataItem.res = [...newData]
        }
        return dataItem;
      }
    }
  }

  notify(message, type = 'info', duration = 0.8, opts = {}) {
    notification[type]({ message, duration, ...opts })
  }

  onClose() {
    this.setState({
      isEdit:false
    });
    this.props.dispatch(hideRecordDetail());
  }

  onMenuChange(e) {
    this.setState({
      pageIndex: e.key,
    });
  }

  hasWebSocket (recordDetail = {}) {
    return recordDetail && recordDetail.method && recordDetail.method.toLowerCase() === 'websocket';
  }

  getRequestDiv(recordDetail) {
    return <RecordRequestDetail 
              recordDetail={recordDetail} 
              isEdit={this.state.isEdit}
              editType = {this.state.editType}
              tabelHandleAdd = {this.tabelHandleAdd}
              tableHandleDelete = {this.tableHandleDelete}
              tableHandleCellChange = {this.tableHandleCellChange}
              bodyItem = {this.state.bodyItem.req}
              headersItem = {this.state.headersItem.req}
              baseConfig = {this.state.baseConfig.req}
            />;
  }

  getResponseDiv(recordDetail) {
    return <RecordResponseDetail 
              recordDetail={recordDetail} 
              isEdit={this.state.isEdit}
              editType = {this.state.editType}
              tabelHandleAdd = {this.tabelHandleAdd}
              tableHandleDelete = {this.tableHandleDelete}
              tableHandleCellChange = {this.tableHandleCellChange}
              bodyItem = {this.state.bodyItem.res}
              headersItem = {this.state.headersItem.res}
              baseConfig = {this.state.baseConfig.res}
            />;
  }

  getWsMessageDiv(recordDetail) {
    return <RecordWsMessageDetail recordDetail={recordDetail} />;
  }

  getRecordContentDiv(recordDetail = {}, fetchingRecord) {
    const getMenuBody = () => {
      let menuBody = null;
      switch (this.state.pageIndex) {
        case PageIndexMap.REQUEST_INDEX: {
          menuBody = this.getRequestDiv(recordDetail);
          break;
        }
        case PageIndexMap.RESPONSE_INDEX: {
          menuBody = this.getResponseDiv(recordDetail);
          break;
        }
        case PageIndexMap.WEBSOCKET_INDEX: {
          menuBody = this.getWsMessageDiv(recordDetail);
          break;
        }
        default: {
          menuBody = this.getRequestDiv(recordDetail);
          break;
        }
      }
      return menuBody;
    }

    const websocketMenu = (
      <Menu.Item key={PageIndexMap.WEBSOCKET_INDEX}>WebSocket</Menu.Item>
    );

    const editType =(
      <Menu onClick={this.onEdit}>
      <Menu.Item key={ProxyRecordTypeMap.REWRITE}>
        <a href="#">rewrite</a>
      </Menu.Item>
      <Menu.Item key={ProxyRecordTypeMap.REMOTE}>
        <a href="#">remote</a>
      </Menu.Item>
      <Menu.Item key={ProxyRecordTypeMap.LOCAL_MAP}>
        <a href="#">local map</a>
      </Menu.Item>
    </Menu>
    )
    return (
      <div className={Style.wrapper} >
        <div>
          <Menu onClick={this.onMenuChange} style={{ display: 'inline-flex' }} mode="horizontal" selectedKeys={[this.state.pageIndex]} >
            <Menu.Item key={PageIndexMap.REQUEST_INDEX}>Request</Menu.Item>
            <Menu.Item key={PageIndexMap.RESPONSE_INDEX}>Response</Menu.Item>
            {this.hasWebSocket(recordDetail) ? websocketMenu : null}
          </Menu>
          {/* {this.getProxyItemMenu(Test_proxyList)} */}
          {this.getProxyItemMenu(this.props.requestRecord.recordProxyRuleList)}
          <div className={Style.editWrapper}>
            {this.state.isEdit && <strong style={{'paddingRight':'10px','color':'red'}}>当前编辑模式：{this.state.editType}</strong>}
            {/* <Button className={Style.btn} onClick={this.onEdit}>edit</Button> */}
            <Dropdown overlay={editType}>
              <Button className={Style.btn}>Edit</Button>
            </Dropdown>
            <Button className={Style.btn} onClick={this.onSave}>Save</Button>
          </div>
        </div>
        <div className={Style.detailWrapper} >
          {fetchingRecord ? this.getLoaingDiv() : getMenuBody()}
        </div>
        {/* {this.state.isEdit && 
          <div className={Style.editDetailWrapper} >
            {fetchingRecord ? this.getLoaingDiv() : getEditMenuBody()}
          </div>
        } */}
      </div>
    );
  }
  getProxyItemMenu (proxyRecord){
    let rewriteList = proxyRecord[ProxyRecordTypeMap.REWRITE] || [];
    let localMapList = proxyRecord[ProxyRecordTypeMap.LOCAL_MAP] || [];
    let remoteList = proxyRecord[ProxyRecordTypeMap.REMOTE] || [];
    return(
      <div className={Style.tagWarpper}>
        {rewriteList.length>0 && 
          <Dropdown overlay={this.getProxyItemDiv(rewriteList)} placement="bottomCenter" arrow>
            <Tag color="#2db7f5">rewrite</Tag>
          </Dropdown>
        }
        {localMapList.length>0 && 
          <Dropdown overlay={this.getProxyItemDiv(localMapList)} placement="bottomCenter" arrow>
            <Tag color="#87d068">local map</Tag>
          </Dropdown>
        }
        {remoteList.length>0 && 
          <Dropdown overlay={this.getProxyItemDiv(remoteList)} placement="bottomCenter" arrow>
            <Tag color="#D8C440">remote</Tag>
          </Dropdown>
        }       
      </div>
    )
  }
  getProxyItemDiv(proxyRecordList){
    return (
      <Menu onClick={this.onClickItem}>
        {proxyRecordList.map((v,id) =>{
          return <Menu.Item key={v.name} disabled={v.disabled} data={v}>{v.name}</Menu.Item>
        })}
      </Menu>
    )
  }

  getLoaingDiv() {
    return (
      <div className={Style.loading}>
        <Spin />
        <div className={Style.loadingText}>LOADING...</div>
      </div>
    );
  }

  getRecordDetailDiv() {
    const { requestRecord, globalStatus } = this.props;
    const recordDetail = requestRecord.recordDetail;
    const fetchingRecord = globalStatus.fetchingRecord;

    if (!recordDetail && !fetchingRecord) {
      return null;
    }
    return this.getRecordContentDiv(recordDetail, fetchingRecord);
  }

  componentWillReceiveProps(nextProps) {
    const { requestRecord } = nextProps;
    const { pageIndex } = this.state;
    // if this is not websocket, reset the index to RESPONSE_INDEX
    if (!this.hasWebSocket(requestRecord.recordDetail) && pageIndex === PageIndexMap.WEBSOCKET_INDEX) {
      this.setState({
        pageIndex: PageIndexMap.RESPONSE_INDEX
      });
    }
    if(requestRecord.recordDetail !=null && (this.state.originRecord==null || this.state.originRecord.id!=requestRecord.recordDetail.id)){
      console.log('11111111111111111');
      console.log(requestRecord);
      // let new_dafaultBaseConfig = Object.assign({},defaultBaseConfig);
      let new_dafaultBaseConfig = JSON.parse(JSON.stringify(defaultBaseConfig))
      new_dafaultBaseConfig.req[0].regexUrl = requestRecord.recordDetail.path.split('?')[0];
      new_dafaultBaseConfig.res[0].regexUrl = requestRecord.recordDetail.path.split('?')[0];
      this.setState({
        isEdit:false,
        originRecord:JSON.parse(JSON.stringify(requestRecord.recordDetail)),
        editRecordDetail:JSON.parse(JSON.stringify(requestRecord.recordDetail)),
        bodyItem:{req:[],res:[]},
        headersItem:{req:[],res:[]},
        baseConfig: {req:[],res:[]},
      },function (){
        this.setState({
          baseConfig: new_dafaultBaseConfig
        });
      });
    }else{
      // this.setState({
      //   isEdit:false,
      //   bodyItem:{req:[],res:[]}, 
      //   headersItem:{req:[],res:[]},
      //   baseConfig: JSON.parse(JSON.stringify(defaultBaseConfig)),
      // });
    }
    
  }

  render() {
    console.log('---------------run record_detail-------------->')
    // console.log(this.state.baseConfig);
    // console.log(this.state.headersItem);
    // console.log(this.state.bodyItem);
    // console.log(this.state.editType);
    // console.log(this.state.originRecord);
    // console.log(this.state.editRecordDetail);
    return (
      <ModalPanel
        onClose={this.onClose}
        hideBackModal
        visible={this.props.requestRecord.recordDetail !== null}
        left="50%"
      >
        {this.getRecordDetailDiv()}
      </ModalPanel>
    );
  }
}

export default RecordDetail;
