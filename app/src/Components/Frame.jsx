import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import prefix from '../UI/utils/prefix';
import getUnhandledProps from '../UI/utils/getUnhandledProps';
import defaultProps from '../UI/utils/defaultProps';

class Frame extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSelect = (event) => {
    event.persist();
    event.selected = true;
    const { onSelect } = this.props;
    if (onSelect) {
      onSelect(event);
    }

    if (event.selected) {
      this.handleToggle();
    }
  };

  addPrefix = (name) => prefix(this.props.classPrefix)(name);

  renderBody() {
    const { children, bodyFill } = this.props;
    const classes = classNames(this.addPrefix('body'), {
      [this.addPrefix('body-fill')]: bodyFill
    });

    return <div className={classes}>{children}</div>;
  }

  renderHeading(headerRole) {
    let { header } = this.props;

    if (!header) {
      return null;
    }

    if (!React.isValidElement(header) || Array.isArray(header)) {
      header = header;
    } else {
      const className = classNames(this.addPrefix('title'), header.props.className);
      header = React.cloneElement(header, { className });
    }
    return (
      <div
        role="rowheader"
        className={this.addPrefix('heading')}
        onClick={this.handleSelect}
        tabIndex={-1}
      >
        {header}
      </div>
    );
  }

  /**
   *
   * @param {React.Node} header
   * @param {string} [headerRole]
   * @returns
   * @memberof Frame
   */
  renderAnchor(header, headerRole) {
    const { id } = this.props;

    return (
      <a
        href={`#${id || ''}`}
        role={headerRole}
      >
        {header}
      </a>
    );
  }

  render() {
    const {
      headerRole,
      className,
      bordered,
      classPrefix,
      id,
      ...props
    } = this.props;

    const classes = classNames(classPrefix, this.addPrefix('default'), className, {
      [this.addPrefix('bordered')]: bordered
    });

    const unhandled = getUnhandledProps(Frame, props);

    return (
      <div {...unhandled} className={classes} onSelect={null} id={id}>
        {this.renderHeading(headerRole)}
        {this.renderBody()}
    </div>
    );
  }
}

export default defaultProps({
  classPrefix: 'frame',
  bordered: false,
  bodyFill: true,
  header: '',
  id: null,
  headerRole: '',
  classPrefix: '',
  children: null,

  onSelect: () => {},
  onEnter: () => {},
  onEntering: () => {},
  onEntered: () => {},
  onExit: () => {},
  onExiting: () => {},
  onExited: () => {},
  className: ''
})(Frame);