import { Table, Input, Select, Button, Popconfirm } from 'antd';
import React from 'react';
import Style from './record-detail-body-table.less';
const Option = Select.Option;

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
          onChange={this.props.onCellChange(record.key, 'beforeData')}
        />
      ),
    }, {
      title: '修改后数据',
      dataIndex: 'afterData',
      width:'45%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'afterData')}
        />
      ),
    }, {
      title: '操作',
      dataIndex: 'isDelete',
      width:'10%',
      render: (text, record) => {
        return (
          this.props.dataSource.length > 1 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.props.onDelete(record.key)}>
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
          <Select defaultValue="更新" onChange={this.props.onCellChange(record.key,'headerType',record.tableType)}>
            <Option value="update">更新</Option>
            <Option value="add">新增</Option>
            <Option value="delete">删除</Option>
          </Select>
        </div>
      ),
    },{
      title: '请求头名称',
      dataIndex: 'headerName',
      width: '15%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'headerName',record.tableType)}
        />
      ),
    },{
      title: '修改前数据',
      dataIndex: 'beforeData',
      width: '35%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'beforeData',record.tableType)}
        />
      ),
    }, {
      title: '修改后数据',
      dataIndex: 'afterData',
      width:'35%',
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
          this.props.dataSource.length > 1 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.props.onDelete(record.key,record.tableType)}>
              <a href="#">Delete</a>
            </Popconfirm>
          ) : null
        );
      },
    }];
  }
  render() {
    const dataSource  = this.props.dataSource;
    console.log('---------table------------------------------------------------------------------>');
    console.log(dataSource);
    const columns = this.props.tableType==0?this.headerColumns:this.bodyColumns;
    return (
      <div>
        <Button className={Style.editableAddBtn} onClick={this.props.handleAdd(tableType)}>Add</Button>
        <Table bordered dataSource={dataSource} columns={columns} pagination={false} />
      </div>
    );
  }
}


export default RecordDetailBodyTable;