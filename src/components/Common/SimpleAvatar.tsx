import React from 'react';
import ReactAvatar from 'react-avatar';

type SimpleAvatarType = {
  width: number
  picture: string | null
  name: string
}

const SimpleAvatar: React.FC<SimpleAvatarType> = React.memo((props: SimpleAvatarType) => {
  const { width, picture, name } = props
  // const color = getRandomColorForAvatar()
  const stc = require('string-to-color');
  const color = stc(name);
  return (
      <ReactAvatar
        color={color}
        src={ picture || '' }
        size={`${width}`}
        name={name}
        textSizeRatio={1.5}
        round="1000px"
      />
  )
})

export default SimpleAvatar
