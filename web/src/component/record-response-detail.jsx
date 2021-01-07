/**
 * The panel to display the response detial of the record
 *
 */

import React, { PropTypes } from 'react';
import ClassBind from 'classnames/bind';
import { Menu, Table, notification, Spin } from 'antd';
import JsonViewer from 'component/json-viewer';
import ModalPanel from 'component/modal-panel';
import RecordDetailBodyTable from './record-detail-body-table';

import Style from './record-detail.less';
import CommonStyle from '../style/common.less';

const StyleBind = ClassBind.bind(Style);
const PageIndexMap = {
  REQUEST_INDEX: 'REQUEST_INDEX',
  RESPONSE_INDEX: 'RESPONSE_INDEX'
};

// the maximum length of the request body to decide whether to offer a download link for the request body
const MAXIMUM_REQ_BODY_LENGTH = 10000;

class RecordResponseDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      isEdit:false
    };

  }

  static propTypes = {
    recordDetail: PropTypes.object
  }
  componentWillReceiveProps(nextProps){
    // console.log('77777777777777777777777777'); //组件调用2次，这个方法只执行一次，没明白原因
    // console.log(nextProps);
    this.setState({
      isEdit:nextProps.isEdit||false
    });
  }
  onSelectText(e) {
    selectText(e.target);
  }

  getLiDivs(targetObj) {
    const liDom = Object.keys(targetObj).map((key) => {
      return (
        <li key={key} className={Style.liItem} >
          <strong>{key} : </strong>
          <span>{targetObj[key]}</span>
        </li>
      );
    });

    return liDom;
  }

  getImageBody(recordDetail) {
    return <img src={recordDetail.ref} className={Style.imageBody} />;
  }

  getJsonBody(recordDetail) {
    return <JsonViewer data={recordDetail.resBody} />;
  }

  getResBodyDiv() {
    const { recordDetail } = this.props;

    const self = this;

    let reqBodyDiv = <div className={Style.codeWrapper}> <pre>{recordDetail.resBody} </pre></div>;

    switch (recordDetail.type) {
      case 'image': {
        reqBodyDiv = <div > {self.getImageBody(recordDetail)} </div>;
        break;
      }
      case 'json': {
        reqBodyDiv = self.getJsonBody(recordDetail);
        break;
      }

      default: {
        if (!recordDetail.resBody && recordDetail.ref) {
          reqBodyDiv = <a href={recordDetail.ref} target="_blank">{recordDetail.fileName}</a>;
        }
        break;
      }
    }

    return (
      <div className={Style.resBody} >
        {reqBodyDiv}
      </div>
    );
  }

  getResponseDiv(recordDetail) {
    const statusStyle = StyleBind({ okStatus: recordDetail.statusCode === 200 });

    return (
      <div>
        <div className={Style.section} >
          <div >
            <span className={CommonStyle.sectionTitle}>General</span>
          </div>
          <div className={CommonStyle.whiteSpace10} />
          <ul className={Style.ulItem} >
            <li className={Style.liItem} >
              <strong>Status Code:</strong>
              <span className={statusStyle} > {recordDetail.statusCode} </span>
            </li>
          </ul>
          {this.state.isEdit && 
            <RecordDetailBodyTable
              tableType={'TABLE_BASE'}
              editType= {this.props.editType}
              dataSource = {this.props.baseConfig}
              onDelete = {this.props.tableHandleDelete}
              handleAdd = {this.props.tabelHandleAdd}
              onCellChange = {this.props.tableHandleCellChange}
            />
          }
        </div>
        <div className={Style.section} >
          <div >
            <span className={CommonStyle.sectionTitle}>Header</span>
          </div>
          <div className={CommonStyle.whiteSpace10} />
          <ul className={Style.ulItem} >
            {this.getLiDivs(recordDetail.resHeader)}
          </ul>
          {this.state.isEdit && this.props.editType=='REWRITE'?
            <RecordDetailBodyTable
              tableType={'TABLE_HEADER'}
              dataSource = {this.props.headersItem}
              onDelete = {this.props.tableHandleDelete}
              handleAdd = {this.props.tabelHandleAdd}
              onCellChange = {this.props.tableHandleCellChange}
            />:null}
        </div>

        <div className={Style.section} >
          <div >
            <span className={CommonStyle.sectionTitle}>Body</span>
          </div>
          <div className={CommonStyle.whiteSpace10} />
          {this.getResBodyDiv()}
          {this.state.isEdit && this.props.editType=='REWRITE'?
            <RecordDetailBodyTable
              tableType={'TABLE_BODY'}
              dataSource = {this.props.bodyItem}
              onDelete = {this.props.tableHandleDelete}
              handleAdd = {this.props.tabelHandleAdd}
              onCellChange = {this.props.tableHandleCellChange}
            />:null}
        </div>
      </div>
    );
  }

  render() {
    return this.getResponseDiv(this.props.recordDetail);
  }
}

export default RecordResponseDetail;
