import { Avatar } from '@material-ui/core';
import React from 'react';
import { NavLink } from 'react-router-dom';
import ReactAvatar from 'react-avatar';
import { getFirstLetter } from '../../helper/helperFunctionsTs';

type ColoredNavAvatarType = {
  width: number
  src: string | null
  name: string
  to: object | string
}

const ColoredNavAvatar: React.FC<ColoredNavAvatarType> = React.memo((props: ColoredNavAvatarType) => {
  const { width, src, name, to } = props
  const stc = require('string-to-color');
  const background = stc(name);
  const splittedName = name.split(' ')
  const letters = `${getFirstLetter(splittedName[0])}${getFirstLetter(splittedName[1])}`


  return (
    <Avatar
      // component={NavLink}
      // to={to}
      src={ src || '' }
      // children={letters}
      style={{
        // width,
        // height: width,
        // background
      }}
    />
  )
})

export default ColoredNavAvatar
