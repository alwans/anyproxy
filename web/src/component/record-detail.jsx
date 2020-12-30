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
const ItemTableMap = {
  TABLE_HEADER:"TABLE_HEADER",
  TABLE_BODY:"TABLE_BODY"
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

class RecordDetail extends React.Component {
  constructor() {
    super();
    this.onClose = this.onClose.bind(this);
    this.state = {
      pageIndex: PageIndexMap.REQUEST_INDEX,
      isEdit:false,  // page can be edited
      originRecordDetail:null,  //origin or Before modification record detail
      editRecordDetail:null, //modified record detail
      bodyItem:{req:[],res:[]},   //obj-keys:[tableType,beforData,afterData,isDelete]
      headersItem:{req:[],res:[]}  //obj-keys:[tableType,headerName,beforeData,afterData,isDelete]
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
              tabelHandleAdd = {this.tabelHandleAdd}
              tableHandleDelete = {this.tableHandleDelete}
              tableHandleCellChange = {this.tableHandleCellChange}
              bodyItem = {this.state.bodyItem.req}
              headersItem = {this.state.headersItem.req}
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
        bodyItem:{req:[],res:[]},
        headersItem:{req:[],res:[]}
      });
    }else{
      this.setState({
        isEdit:false,
        bodyItem:{req:[],res:[]}, 
        headersItem:{req:[],res:[]}
      });
    }
    
  }

  render() {
    console.log('----------------------------->')
    console.log(this.state.bodyItem);
    console.log(this.state.originRecordDetail);
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
