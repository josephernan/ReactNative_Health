'use strict';

let React = require('react-native');

let {
  Component,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

let styleGuide = require('../style-guide');
let Icon = require('react-native-vector-icons/FontAwesome');

/**
 * MenuItem component
 * @param  {Object} props.icon       optional FontAwesome icon id
 * @param  {Object} props.text       text for the menu item
 * @param  {Object} props.press      a custom onPress event
 */
class MenuItem extends Component {
  render() {
    let text = (<Text style={styles.menuItemText}>{this.props.text}</Text>);

    if (this.props.icon !== undefined) {
      text = (
        <Text style={styles.menuItemText}>
          <Icon name={this.props.icon} />
          &nbsp;
          {this.props.text}
        </Text>
      );
    }

    return (
      <View style={styles.menuItemOuter}>
        <TouchableOpacity
          onPress={this.props.onPress}>
          <View style={styles.menuItemInner}>{text}</View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  menuItemOuter: {
    borderStyle: 'solid',
    borderColor: styleGuide.grays.light,
    borderBottomWidth: 1,
    padding: 10
  },
  menuItemText: {}
});

module.exports = MenuItem;
