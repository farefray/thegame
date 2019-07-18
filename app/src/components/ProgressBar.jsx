import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ProgressBar extends Component {

  _isMounted = false;
  constructor (props) {
    super(props);
    this.state = {
      'loadingCounter': 1
    }
  }

  updateUI() {
    if (!this._isMounted) {
      return false;
    }

    RPGUI.update(ReactDOM.findDOMNode(this)) // eslint-disable-line
  }

  componentDidMount() {
    this._isMounted = true;
    this.updateUI()
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render () {
    let loadingCounter = this.state.loadingCounter || 1;
    if (this.props.progress < 100) {
      loadingCounter = (loadingCounter === 3 ? 1 : loadingCounter + 1);

      setTimeout(() => {
        if (this._isMounted) {
          this.setState({...this.state, 'loadingCounter': loadingCounter})
          this.props.dispatch({ type: 'LOADING_STRING', loadingCounter })
          this.updateUI()
        }
      }, 1000);
    };

    // TODO make it universal and pass text from parent
    const loadingString = (this.props.progress > 0 ? 'Loading' + '.'.repeat(loadingCounter) : 'Connecting' + '.'.repeat(loadingCounter));

    const value = (this.props.progress || 0) / 100;
    return (<div data-value={value} className="rpgui-progress green" data-rpguitype="progress" data-text={loadingString}></div>);
  }
}

export default ProgressBar;