import { getClassNamePrefix } from './prefix';

export default function defaultProps(props) {
  const { classPrefix, ...rest } = props;

  return (WrappedComponent) => {
    class DefaultPropsComponent extends WrappedComponent {
      // for IE9 & IE10 support
      static contextTypes = WrappedComponent.contextTypes;
      static childContextTypes = WrappedComponent.childContextTypes;
      static getDerivedStateFromProps = WrappedComponent.getDerivedStateFromProps;

      static defaultProps = {
        ...WrappedComponent.defaultProps,
        classPrefix: classPrefix ? `${getClassNamePrefix()}${classPrefix}` : undefined,
        ...rest
      };

      render() {
        return super.render();
      }
    }

    return DefaultPropsComponent;
  };
}
