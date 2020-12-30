import { Table, Input, Icon, Button, Popconfirm } from 'antd';
import React from 'react';


class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: false,
  }
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
  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              <Input
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className="editable-cell-icon-check"
                onClick={this.check}
              />
            </div>
            :
            <div className="editable-cell-text-wrapper">
              {value || ' '}
              <Icon
                type="edit"
                className="editable-cell-icon"
                onClick={this.edit}
              />
            </div>
        }
      </div>
    );
  }
}

class RecordDetailBodyTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [{
      title: '修改前数据',
      dataIndex: 'beforeData',
      width: '40%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'beforeData')}
        />
      ),
    }, {
      title: '修改后数据',
      dataIndex: 'afterData',
      width:'40%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.props.onCellChange(record.key, 'afterData')}
        />
      ),
    }, {
      title: '是否删除',
      dataIndex: 'isDelete',
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
  }
  // onCellChange = (key, dataIndex) => {
  //   return (value) => {
  //     const dataSource = [...this.state.dataSource];
  //     const target = dataSource.find(item => item.key === key);
  //     if (target) {
  //       target[dataIndex] = value;
  //       this.setState({ dataSource });
  //     }
  //   };
  // }
  // onDelete = (key) => {
  //   const dataSource = [...this.state.dataSource];
  //   this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  // }
  // handleAdd = () => {
  //   const { count, dataSource } = this.state;
  //   const newData = {
  //     key: count,
  //     name: `Edward King ${count}`,
  //     age: 32,
  //     address: `London, Park Lane no. ${count}`,
  //   };
  //   this.setState({
  //     dataSource: [...dataSource, newData],
  //     count: count + 1,
  //   });
  // }
  render() {
    const dataSource  = this.props.dataSource;
    console.log('---------table------------------------------------------------------------------>');
    console.log(dataSource);
    const columns = this.columns;
    return (
      <div>
        <Button className="editable-add-btn" onClick={this.props.handleAdd}>Add</Button>
        <Table bordered dataSource={dataSource} columns={columns} />
      </div>
    );
  }
}


export default RecordDetailBodyTable;