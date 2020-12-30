/**
 * The panel to display the detial of the record
 *
 */

import React, { PropTypes } from 'react';
import ClassBind from 'classnames/bind';
import { Menu, Dropdown,Spin,notification,message,Button,Input,Tag } from 'antd';
import ModalPanel from 'component/modal-panel';
import RecordRequestDetail from 'component/record-request-detail';
import RecordResponseDetail from 'component/record-response-detail';
import RecordWsMessageDetail from 'component/record-ws-message-detail';
import { hideRecordDetail } from 'action/recordAction';

import Style from './record-detail.less';

const StyleBind = ClassBind.bind(Style);
const PageIndexMap = {
  REQUEST_INDEX: 'REQUEST_INDEX',
  RESPONSE_INDEX: 'RESPONSE_INDEX',
  WEBSOCKET_INDEX: 'WEBSOCKET_INDEX'
};
const ProxyRecordType = {
  REWRITE:'REWRITE',
  LOCAL_MAP:'LOCAL_MAP',
  REMOTE:'REMOTE'
};
const Test_proxyList = {
  REWRITE:[{name:'rewire_1',disabled:true},{name:'rewire_2',disabled:false},{name:'rewire_3',disabled:false}],
  // LOCAL_MAP:[{name:'localMap_1'},{name:'localMap_2'},{name:'localMap_3'}],
  LOCAL_MAP:[],
  REMOTE:[{name:'remote_1',disabled:false},{name:'remote_2',disabled:true},{name:'remote_3',disabled:false}]
};

class RecordDetail extends React.Component {
  constructor() {
    super();
    this.onClose = this.onClose.bind(this);
    this.state = {
      pageIndex: PageIndexMap.REQUEST_INDEX,
      isEdit:false,  // page can be edited
      originRecordDetail:null,  //origin or Before modification record detail
      editRecordDetail:null, //modified record detail
      addHeaders:{req:[],res:[]}, //add headers key list obj
      delHeaders:{req:[],res:[]},  //delete headers key list obj
      updateHeaders:{req:[],res:[]},
      bodyItem:{req:[],res:[]}   //obj-keys:[beforData,afterData,isDelete]
    };
    this.onSave = this.onSave.bind(this); 
    this.onEdit = this.onEdit.bind(this); 
    this.onChange = this.onChange.bind(this); // headers input event
    this.onAddHeader =  this.onAddHeader.bind(this); 
    this.onDelHeader = this.onDelHeader.bind(this); 
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
    this.setState({
      isEdit:false
    });
    this.notify('SAVE SUCCESS', 'success')
  }
  onEdit(){ //edit btn -->onClick
    this.setState({
      isEdit:true
    });
  }
  globalNotify(msg){
    message.info(msg);
  }
  onClickItem(e){
    // console.log('-->click item');
    // console.log(e);
    this.setState({isEdit:true});
  }

  onChange (event) {  //header value input --> onChange
    let dataType;
    let key;
    let headersList;
    let new_addHeaders = this.state.addHeaders;
    if(event.target.name.split('-')){
      dataType='1';
    }else{
      [dataType,key] = event.target.name.split('-');
    }
    let new_record = Object.assign(dataType=='0'? this.state.originRecordDetail :  this.state.editRecordDetail);
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        headersList = this.state.addHeaders.req;
        let header_obj = new_record.reqHeader;
        [headersList,header_obj] = this.headerHandler(event, headersList, header_obj);
        if(headersList ==void 0 || header_obj == void 0){
          return -1;
        } 
        new_record.reqHeader = header_obj;
        new_addHeaders.req =  headersList;
        break;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        headersList = this.state.addHeaders.res;
        let header_obj = new_record.resHeader;
        [headersList,header_obj] = this.headerHandler(event, headersList, header_obj);
        if(headersList ==void 0 || header_obj == void 0){
          return -1;
        }
        new_record.resHeader = header_obj;
        new_addHeaders.res = headersList;
        break;
      }
    }
    console.log('new record--->');
    console.log(new_record);
    if(dataType=='0'){
      this.setState({
        addHeaders:new_addHeaders,
        originRecordDetail:new_record
      });
    }else{
      this.setState({
        addHeaders:new_addHeaders,
        editRecordDetail:new_record
      });
    }
  }

  headerKeyHandler(event,new_headersList,header_obj){
    let[index,key] = event.target.name.split('-');
    let key_value = event.target.value;
    console.log('key_value = ',key_value);
    let old_key_value = new_headersList[index];
    console.log('old_key_value = ',old_key_value);
    new_headersList[index] = key_value;
    let old_value = header_obj[old_key_value] || '';
    console.log('old value = ',old_value);
    delete header_obj[old_key_value];
    header_obj[key_value] = old_value;
    return [new_headersList,header_obj];
  }

  headerHandler(event,headersList,header_obj){
    let [dataType,key] = event.target.name.split('-');
    let value = event.target.value;
    console.log(`dataType:${dataType}, key:${key}, value:${value}`);
    let new_addHeaders =  headersList;
    let new_header_obj = Object.assign(header_obj);
    if(event.target.name.includes('defaultKey')){ //处理新增header的key值更新
      return this.headerKeyHandler(event,new_addHeaders,new_header_obj);;
    }
    if(key==''){
      this.globalNotify('请先输入key值');
      new_header_obj['']='';
      return [new_addHeaders,new_header_obj];
    }else{
      new_header_obj[key] = value;
      return [new_addHeaders,new_header_obj];
    }
  }

  onAddHeader(){  //add header btn --> onClick
    let new_record = Object.assign(this.state.editRecordDetail);
    let new_addHeaders = this.state.addHeaders;
    let new_headersList;
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        let header_obj = new_record.reqHeader;
        new_headersList = new_addHeaders.req;
        [new_headersList,header_obj] = this.addHeaderHandler(new_headersList,header_obj);
        if(new_headersList==void 0 || header_obj ==  void 0){
          return -1
        }
        new_record.reqHeader = header_obj;
        new_addHeaders.req = new_headersList;
        break;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        let header_obj = new_record.resHeader;
        new_headersList = new_addHeaders.res;
        [new_headersList,header_obj] = this.addHeaderHandler(new_headersList,header_obj);
        if(new_headersList==void 0 || header_obj ==  void 0){
          return -1
        }
        new_record.resHeader = header_obj;
        new_addHeaders.res = new_headersList;
        break;
      }
    }
    this.setState({
      addHeaders: new_addHeaders,
      editRecordDetail:new_record
    });
  }

  addHeaderHandler(new_headersList,header_obj){
    if(new_headersList.includes('')){
      this.globalNotify('请先输入上一个新增的key值');
      return [];
    }
    let default_key_value = '';
    header_obj[default_key_value]='';
    new_headersList.push(default_key_value);
    return [new_headersList,header_obj];
  }

  onDelHeader(key){  //header delete --> onClick
    let new_delHeaders = this.state.delHeaders;
    let new_addHeaders = this.state.addHeaders;
    if(key==''){
      switch(this.state.pageIndex){
        case PageIndexMap.REQUEST_INDEX:{
          let index = new_addHeaders.req.indexOf('');
          new_addHeaders.req.splice(index,1);
          break;
        }
        case PageIndexMap.RESPONSE_INDEX:{
          let index = new_addHeaders.res.indexOf('');
          new_addHeaders.res.splice(index,1);
          break;
        }
      }
      this.setState({
        addHeaders:new_addHeaders
      });
    }
    switch(this.state.pageIndex){
      case PageIndexMap.REQUEST_INDEX:{
        new_delHeaders.req.push(key);
        break;
      }
      case PageIndexMap.RESPONSE_INDEX:{
        new_delHeaders.res.push(key);
        break;
      }
    }
    console.log('delete was success');
    console.log(key);
    this.setState({
      addHeaders:new_addHeaders,
      delHeaders:new_delHeaders
    });
  }

  tableHandleDelete = (key) => {
    let bodyItem = Object.assign({},this.state.bodyItem);
    let dataSource = [...bodyItem.req];
    dataSource = dataSource.filter((item) => item.key !== key)
    bodyItem.req = dataSource;
    this.setState({
      bodyItem: bodyItem,
    });
  };

  tabelHandleAdd = () => {
    let bodyItem = Object.assign({},this.state.bodyItem);
    let dataSource = [...bodyItem.req];
    let newIndex = dataSource.length==0?1: dataSource.slice(-1)[0].key+1;
    const newData = {
      key: newIndex,
      beforeData: '',
      afterData: '',
      isDelete: false,
    };
    bodyItem.req = [...dataSource, newData]
    this.setState({
      bodyItem:bodyItem,
    });
  };

  tableHandleCellChange = (key, dataIndex) => {
    return (value) =>{
      let bodyItem = Object.assign({},this.state.bodyItem);
      let newData = [...bodyItem.req];
      const target = newData.find(item => item.key === key);
      if(target){
        target[dataIndex] = value;
        bodyItem.req = [...newData]
        this.setState({
          bodyItem:bodyItem,
        });
      }
      // newData.splice(index, 1, { ...item, ...row });
      // bodyItem.req = [...newData]
      // this.setState({
      //   bodyItem:bodyItem,
      // });
    }
  };

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
              onChange={this.onChange} 
              onAddHeader={this.onAddHeader} 
              onDeleteHeader = {this.onDelHeader}
              isEdit={this.state.isEdit}
              addHeaders ={this.state.addHeaders.req}
              delHeaders = {this.state.delHeaders.req}
              tabelHandleAdd = {this.tabelHandleAdd}
              tableHandleDelete = {this.tableHandleDelete}
              tableHandleCellChange = {this.tableHandleCellChange}
              bodyItem = {this.state.bodyItem.req}
            />;
  }

  getResponseDiv(recordDetail) {
    return <RecordResponseDetail recordDetail={recordDetail} />;
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

    const getEditMenuBody = () => {   //为了区分右边可编辑区域
      let menuBody = null;
      this.state.editRecordDetail.isEdit = true;
      let newrecordDetail =  this.state.editRecordDetail;
      switch (this.state.pageIndex) {
        case PageIndexMap.REQUEST_INDEX: {
          menuBody = this.getRequestDiv(newrecordDetail);
          break;
        }
        case PageIndexMap.RESPONSE_INDEX: {
          menuBody = this.getResponseDiv(newrecordDetail);
          break;
        }
        case PageIndexMap.WEBSOCKET_INDEX: {
          menuBody = this.getWsMessageDiv(newrecordDetail);
          break;
        }
        default: {
          menuBody = this.getRequestDiv(newrecordDetail);
          break;
        }
      }
      return menuBody;
    }

    const websocketMenu = (
      <Menu.Item key={PageIndexMap.WEBSOCKET_INDEX}>WebSocket</Menu.Item>
    );
    return (
      <div className={Style.wrapper} >
        <div>
          <Menu onClick={this.onMenuChange} style={{ display: 'inline-flex' }} mode="horizontal" selectedKeys={[this.state.pageIndex]} >
            <Menu.Item key={PageIndexMap.REQUEST_INDEX}>Request</Menu.Item>
            <Menu.Item key={PageIndexMap.RESPONSE_INDEX}>Response</Menu.Item>
            {this.hasWebSocket(recordDetail) ? websocketMenu : null}
          </Menu>
          {this.getProxyItemMenu(Test_proxyList)}
          <div className={Style.editWrapper}>
          <Button className={Style.btn} onClick={this.onEdit}>edit</Button>
          <Button className={Style.btn} onClick={this.onSave}>save</Button>
        </div>
        </div>
        <div className={Style.detailWrapper} style={this.state.isEdit?{'width':'50%','float':'left'}:{}} >
          {fetchingRecord ? this.getLoaingDiv() : getMenuBody()}
        </div>
        {this.state.isEdit && 
          <div className={Style.editDetailWrapper} >
            {fetchingRecord ? this.getLoaingDiv() : getEditMenuBody()}
          </div>
        }
      </div>
    );
  }
  getProxyItemMenu (proxyRecord){
    let rewriteList = proxyRecord[ProxyRecordType.REWRITE] || [];
    let localMapList = proxyRecord[ProxyRecordType.LOCAL_MAP] || [];
    let remoteList = proxyRecord[ProxyRecordType.REMOTE] || [];
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
          return <Menu.Item key={v.name} disabled={v.disabled}>{v.name}</Menu.Item>
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
    console.log('11111111111111111');
    console.log(requestRecord);
    if(requestRecord.recordDetail !=null && (this.state.originRecordDetail==null || this.state.originRecordDetail.id!=requestRecord.recordDetail.id)){
      this.setState({
        isEdit:false,
        originRecordDetail:JSON.parse(JSON.stringify(requestRecord.recordDetail)),
        editRecordDetail:JSON.parse(JSON.stringify(requestRecord.recordDetail)),
        addHeaders:{req:[],res:[]}, //add headers key list obj
        delHeaders:{req:[],res:[]},  //delete headers key list obj
        updateHeaders:{req:[],res:[]}
      });
    }else{
      this.setState({
        isEdit:false
      });
    }
    
  }

  render() {
    console.log('----------------------------->')
    console.log(this.state.bodyItem);
    console.log(this.state.originRecordDetail);
    console.log(this.state.editRecordDetail);
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
