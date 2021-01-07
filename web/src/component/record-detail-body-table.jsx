import { Table, Input, Select, Button, Popconfirm } from 'antd';
const { TextArea } = Input;
import React from 'react';
import Style from './record-detail-body-table.less';
const Option = Select.Option;

const HeaderOperationMap ={
  UPDATE:'更新',
  ADD:'新增',
  DELETE:'删除'
}

const TableMap = {
  TABLE_HEADER:"TABLE_HEADER",
  TABLE_BODY:"TABLE_BODY",
  TABLE_BASE:"TABLE_BASE"
}

class EditableTextArea extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value,
      editable: false,
    };
    // this.input = React.createRef();
  }
  // state = {
  //   value: this.props.value,
  //   editable: false,
  // }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = () => {
    this.setState({ editable: true });
  }
  componentDidMount () {
    if(this.textInput){
      // console.log(this.textInput);
      // console.log(this.textInput.props.value);
      this.textInput.focus();
    }
  }
  componentDidUpdate () {
    if(this.textInput){
      // console.log(this.textInput);
      // console.log(this.textInput.props.value);
      this.textInput.focus();
    }
  }

  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              <TextArea
                ref={(input) => { this.textInput = input; }}
                autosize  
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
                onBlur={this.check}
              />
              {/* <Input
                ref={(input) => { this.textInput = input; }}
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
                onBlur={this.check}
              /> */}
            </div>
            :
            <div className="editable-cell-text-wrapper" onClick ={this.edit} style={{cursor:"pointer"}}>
              {value || 'click input text'}
            </div>
        }
      </div>
    );
  }
}

class EditableCell extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value,
      editable: false,
    };
    // this.input = React.createRef();
  }
  // state = {
  //   value: this.props.value,
  //   editable: false,
  // }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = () => {
    this.setState({ editable: true });
  }
  componentDidMount () {
    if(this.textInput){
      this.textInput.focus()
    }
  }
  componentDidUpdate () {
    if(this.textInput){
      this.textInput.focus()
    }
  }

  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              <Input
                ref={(input) => { this.textInput = input; }}
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
                onBlur={this.check}
              />
            </div>
            :
            <div className="editable-cell-text-wrapper" onClick ={this.edit} style={{cursor:"pointer"}}>
              {value || 'click input text'}
            </div>
        }
      </div>
    );
  }
}

class RecordDetailBodyTable extends React.Component {
  constructor(props) {
    super(props);
    this.bodyColumns = [{
      title: '修改前数据',
      dataIndex: 'beforeData',
      width: '45%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'beforeData',record.tableType)}
        />
      ),
    }, {
      title: '修改后数据',
      dataIndex: 'afterData',
      width:'45%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'afterData',record.tableType)}
        />
      ),
    }, {
      title: '操作',
      dataIndex: 'isDelete',
      width:'10%',
      render: (text, record) => {
        return (
          this.props.dataSource.length > 0 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.props.onDelete(record.key,record.tableType)}>
              <a href="#">Delete</a>
            </Popconfirm>
          ) : null
        );
      },
    }];
    this.headerColumns = [{
      title: '类型',
      dataIndex: 'headerType',
      width:'5%',
      render: (text, record) => (
        <div>
          <Select defaultValue={HeaderOperationMap[record.headerType]} onChange={this.props.onCellChange(record.key,'headerType',record.tableType)}>
            <Option value="UPDATE">更新</Option>
            <Option value="ADD">新增</Option>
            <Option value="DELETE">删除</Option>
          </Select>
        </div>
      ),
    }
    // ,{
    //   title: '请求头名称',
    //   dataIndex: 'headerName',
    //   width: '15%',
    //   render: (text, record) => (
    //     <EditableCell
    //       value={text}
    //       onChange={this.props.onCellChange(record.key, 'headerName',record.tableType)}
    //     />
    //   ),
    // }
    ,{
      title: '修改前数据',
      dataIndex: 'beforeData',
      width: '40%',
      render: (text, record) => {
        return (
          record.headerType!= 'ADD'?
          (
            <EditableCell
              value={text}
              onChange={this.props.onCellChange(record.key, 'beforeData',record.tableType)}
            />
          ) : null
        );
      },
    }, {
      title: '修改后数据',
      dataIndex: 'afterData',
      width:'45%',
      render: (text, record) => {
        return (
          record.headerType!= 'DELETE'?
          (
            <EditableCell
              value={text}
              onChange={this.props.onCellChange(record.key, 'afterData',record.tableType)}
            />
          ) : null
        );
      },
      // render: (text, record) => (
      //   <EditableCell
      //     value={text}
      //     onChange={this.props.onCellChange(record.key, 'afterData',record.tableType)}
      //   />
      // )
    }, {
      title: '操作',
      dataIndex: 'isDelete',
      width:'10%',
      render: (text, record) => {
        return (
          this.props.dataSource.length > 0 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.props.onDelete(record.key,record.tableType)}>
              <a href="#">Delete</a>
            </Popconfirm>
          ) : null
        );
      },
    }];
    this.baseConfigColumes = [{
      title: '是否禁用',
      dataIndex: 'isDisable',
      width: '5%',
      render: (text, record) => (
        <div>
          <Select defaultValue={text=='yes'?'是':'否'} onChange={this.props.onCellChange(record.key,'isDisable',record.tableType)}>
            <Option value='yes'>是</Option>
            <Option value='no'>否</Option>
          </Select>
        </div>
      ),
    },{
      title: 'regex URL',
      dataIndex: 'regexUrl',
      width: '40%',
      render: (text, record) => (
        <EditableTextArea
          value={text}
          onChange={this.props.onCellChange(record.key, 'regexUrl',record.tableType)}
        />
      ),
    }, {
      title: '是否全局',
      dataIndex: 'isGlobal',
      width:'10%',
      render: (text, record) => (
        <div>
          <Select defaultValue={text=='yes'?'是':'否'} onChange={this.props.onCellChange(record.key,'isGlobal',record.tableType)}>
            <Option value='yes'>是</Option>
            <Option value='no'>否</Option>
          </Select>
        </div>
      ),
    }, {
      title: '是否限制ip',
      dataIndex: 'isIpLimit',
      width:'10%',
      render: (text, record) => (
        <div>
          <Select defaultValue={text=='yes'?'是':'否'} onChange={this.props.onCellChange(record.key,'isIpLimit',record.tableType)}>
            <Option value='yes'>是</Option>
            <Option value='no'>否</Option>
          </Select>
        </div>
      ),
    }, {
      title: '有效IP列表',
      dataIndex: 'ipList',
      width:'40%',
      render: (text, record) => (
        <EditableTextArea
          value={text}
          onChange={this.props.onCellChange(record.key, 'ipList',record.tableType)}
        />
      ),
    },{
      title: 'remote URL',
      dataIndex: 'remoteUrl',
      width:'40%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'remoteUrl',record.tableType)}
        />
      ),
    }];
  }
  render() {
    const dataSource  = this.props.dataSource;
    // console.log(dataSource);
    var columns;
    switch(this.props.tableType){
      case TableMap.TABLE_HEADER:
        columns = this.headerColumns;
        break;
      case TableMap.TABLE_BODY:
        columns = this.bodyColumns;
        break;
      case TableMap.TABLE_BASE:
        let base_columns = [...this.baseConfigColumes];
        // console.log('this.props.editType--->',this.props.editType);
        if(this.props.editType=='REWRITE'){
          base_columns.map((item,index) =>{
            if(item.dataIndex=='remoteUrl'){
              base_columns.splice(index,1);
            }
          });
        }
        if(dataSource[0].isIpLimit=='no'){
          base_columns.map((item,index) =>{
            if(item.dataIndex=='ipList'){
              base_columns.splice(index,1);
            }
          });
        }
        columns = base_columns;
        break;
      default:
        columns = this.bodyColumns;
        break;
    }

    // columns = this.props.tableType=='TABLE_HEADER'?this.headerColumns:this.bodyColumns;
    return (
      <div>
        {this.props.tableType!=TableMap.TABLE_BASE && <Button className={Style.editableAddBtn} onClick={() =>this.props.handleAdd(this.props.tableType)}>Add</Button>}
        <Table bordered dataSource={dataSource} columns={columns} pagination={false} />
      </div>
    );
  }
}


export default RecordDetailBodyTable;