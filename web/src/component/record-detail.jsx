/**
 * The panel to display the detial of the record
 *
 */

import React, { PropTypes } from 'react';
import ClassBind from 'classnames/bind';
import { Menu, Spin,notification,message,Button,Input,Tag } from 'antd';
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

class RecordDetail extends React.Component {
  constructor() {
    super();
    this.onClose = this.onClose.bind(this);
    this.state = {
      pageIndex: PageIndexMap.REQUEST_INDEX,
      isEdit:false,
      originRecordDetail:null,
      editRecordDetail:null,
      addHeaders:null,
      delHeaders:null
    };
    this.onSave = this.onSave.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onAddHeader =  this.onAddHeader.bind(this);
    this.onMenuChange = this.onMenuChange.bind(this);
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
  onEdit(){
    this.setState({
      isEdit:true
    });
  }
  globalNotify(msg){
    message.info(msg);
  }

  onChange (event) {
    let [dataType,key] = event.target.name.split('-');
    if(key==''){
      this.globalNotify('请先输入key值');
    }else if(key=='default'){
      let k_vluae = event.target.value;
      let new_addHeaders =  this.state.addHeaders.slice(0);
      let index = new_addHeaders.indexOf(k_vluae);
      let new_erd = Object.assign(this.state.editRecordDetail);
      let k = new_addHeaders[0];
      console.log('k--->',k);
      delete new_erd.reqHeader[k];
      new_erd.reqHeader[event.target.value]='';
      console.log('new_erd----------------->');
      console.log(new_erd);
    }
    console.log(`key: ${event.target.name}, value: ${event.target.value}`);
  }
  onAddHeader(){
    let new_erd = Object.assign(this.state.editRecordDetail);
    let new_addHeaders = this.state.addHeaders.slice(0);
    let key;
    if(this.state.addHeaders.slice(-1).length>0){
      key = this.state.addHeaders.slice(-1)[0]+' ';
    }else{
      key = '';
    }
    new_erd.reqHeader[key]='';
    new_addHeaders.push(key);
    this.setState({
      editRecordDetail:new_erd,
      addHeaders:new_addHeaders
    });
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
    return <RecordRequestDetail recordDetail={recordDetail} onChange={this.onChange} onAddHeader={this.onAddHeader} isEdit={this.state.isEdit}/>;
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
        <Menu onClick={this.onMenuChange} style={{ display: 'inline-flex' }} mode="horizontal" selectedKeys={[this.state.pageIndex]} >
          <Menu.Item key={PageIndexMap.REQUEST_INDEX}>Request</Menu.Item>
          <Menu.Item key={PageIndexMap.RESPONSE_INDEX}>Response</Menu.Item>
          {this.hasWebSocket(recordDetail) ? websocketMenu : null}
        </Menu>
        <div className={Style.tagWarpper}>
          <Tag color="#2db7f5">rewrite</Tag>
          <Tag color="#87d068">local map</Tag>
          <Tag color="#D8C440">remote</Tag>
        </div>
        <div className={Style.editWrapper}>
          <Button className={Style.btn} onClick={this.onEdit}>edit</Button>
          <Button className={Style.btn} onClick={this.onSave}>save</Button>
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
        addHeaders:[],
        delHeaders:[]
      });
    }else{
      this.setState({
        isEdit:false
      });
    }
    
  }

  render() {
    console.log('----------------------------->')
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
