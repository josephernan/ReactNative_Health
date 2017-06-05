
import React, {
  Image,
} from 'react-native';

import storage from '../storage';
import styleGuide from '../style-guide';

const {state} = storage;

export default function AvatarIcon() {
  return <Image
    style={{
      backgroundColor: styleGuide.grays.medium,
      width: 40,
      height: 40,
      borderRadius: 20
    }}
    source={{uri: state('user-avatar-url')}} />;
}