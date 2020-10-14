/**
 * The panel to edit the filter
 *
 */

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ClassBind from 'classnames/bind';
import { connect } from 'react-redux';
import { Input, Alert } from 'antd';
import ResizablePanel from 'component/resizable-panel';
import { hideFilter, updateDebugFilter } from 'action/globalStatusAction';
import { MenuKeyMap } from 'common/constant';

import Style from './record-debug.less';
import CommonStyle from '../style/common.less';


class RecordDebug extends React.Component {
    constructor () {
        super();
        this.onChange = this.onChange.bind(this);
        this.onClose = this.onClose.bind(this);
        this.filterTimeoutId = null;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        globalStatus: PropTypes.object
    }

    onChange (event) {
        this.props.dispatch(updateDebugFilter(event.target.value));
    }

    onClose () {
        this.props.dispatch(hideFilter());
    }

    render() {
        const description = (
            <ul className={Style.tipList} >
                <li>debug list</li>
            </ul>
        );

        const panelVisible = this.props.globalStatus.activeMenuKey === MenuKeyMap.DEBUG_LIST;

        return (
            <ResizablePanel onClose={this.onClose} visible={panelVisible} >
                <div className={Style.filterWrapper} >
                    <div className={Style.title} >
                        DEBUG LIST
                    </div>
                    <div className={CommonStyle.whiteSpace30} />
                    <div className={Style.filterInput} >
                        <Input
                            type="textarea"
                            placeholder="Type the filter here"
                            rows={ 6 }
                            onChange={this.onChange}
                            value={this.props.globalStatus.debugFilterStr}
                        />
                    </div>
                    <div className={Style.filterTip} >
                        <Alert
                            type="info"
                            message="TIPS"
                            description={description}
                            showIcon
                        />
                    </div>
                </div>

            </ResizablePanel>
        );
    }
}

function select (state) {
    return {
        globalStatus: state.globalStatus
    };
}

export default connect(select)(RecordDebug);
