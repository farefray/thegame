import * as React from 'react';
import classNames from 'classnames';

import prefix from '../UI/utils/prefix';

class Frame extends React.Component {
  static defaultProps = {
    classPrefix: 'rs-frame',
    type: 'default', // default || complete || lock
    header: '',
    className: ''
  };

  handleClick = event => {
    event.persist();
    const { onClick } = this.props;
    if (onClick) {
      onClick(event);
    }
  };

  addPrefix = name => prefix(this.props.classPrefix)(name);

  renderBody() {
    const { children } = this.props;
    const classes = classNames(this.addPrefix('body'));

    return <div className={classes}> {children} </div>;
  }

  renderHeading() {
    let { header } = this.props;

    if (!header) {
      return null;
    }

    if (React.isValidElement(header)) {
      const className = classNames(this.addPrefix('title'), header.props.className);
      header = React.cloneElement(header, {
        className
      });
    }
    return (
      <div role="rowheader" className={this.addPrefix('heading')} tabIndex={-1}>
        {header}{' '}
      </div>
    );
  }

  render() {
    const { className, type, classPrefix } = this.props;
    const classes = classNames(classPrefix, this.addPrefix('default'), className, this.addPrefix(type));

    return (
      <div className={classes} onSelect={null} onClick={this.handleClick}>
        {this.renderHeading()}
        <div className={this.addPrefix('inner')}>
        {this.renderBody()}
        </div>
      </div>
    );
  }
}

/* Possible event
  onSelect: () => {},
  onEnter: () => {},
  onEntering: () => {},
  onEntered: () => {},
  onExit: () => {},
  onExiting: () => {},
  onExited: () => {}
*/

export default Frame;
