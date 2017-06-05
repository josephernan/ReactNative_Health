'use strict';
import React, {
  View,
  Animated,
  Component,
  PropTypes,
  TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class Refresh extends Component {
  static propTypes = {
    on: PropTypes.bool,
    onPress: PropTypes.func,
  };
  static defaultProps = {
    on: true,
  };
  constructor(props) {
    super(props);

    this.state = {
      rotate: new Animated.Value(1),
    };
  }

  componentDidMount() {
    if (this.props.on) {
      this.startRotate();
    } else {
      this.stopped = true;
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.on && this.props.on) {
      this.shouldStop = false;
      if (this.stopped) {
        this.stopped = false;
        this.startRotate();
      }
    } else if (prevProps.on && !this.props.on) {
      this.shouldStop = true;
    }
  }

  startRotate() {
    if (this.shouldStop) {
      this.stopped = true;
      return;
    }

    Animated.sequence([
      Animated.timing(this.state.rotate, {
        toValue: 1,
        duration: 1000,
      }),
      Animated.timing(this.state.rotate, {
        toValue: 0,
        duration: 0,
      }),
    ]).start(this.startRotate.bind(this));
  }

  render() {
    let { rotate } = this.state;
    let animatedHeartStyles = {
      transform: [{
        rotate: rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      }]
    };

    let child;
    if (this.props.children) {
      child = this.props.children;
    } else {
      const icon = <Icon
        style={{
          marginLeft: 3
        }}
        name="refresh"
        size={16}
        color="#7e7977" />;
      if (this.props.onPress) {
        child = <TouchableHighlight
          {...this.props}
          onPress={this.props.onPress}>
          {icon}
        </TouchableHighlight>;
      } else {
        child = icon;
      }
    }

    return <Animated.View style={animatedHeartStyles}>
      {child}
    </Animated.View>;
  }
}
