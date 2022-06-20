import { Avatar } from '@material-ui/core';
import React from 'react';
import { NavLink } from 'react-router-dom';
// @ts-ignore
import ReactAvatar from 'react-avatar';
import { getRandomColorForAvatar } from '../../helper/helperFunctions';

type NavLinkAvatarType = {
  width: number
  picture: string | null
  to: string
  name: string
}

const NavLinkAvatar: React.FC<NavLinkAvatarType> = React.memo((props: NavLinkAvatarType) => {
  const { width, picture, to, name } = props
  // const color = getRandomColorForAvatar()

  const stc = require('string-to-color');
  const color = stc(name);

  return (
    <NavLink
      to={to}
      style={{borderRadius: 1000}}
    >
      <div>
      <ReactAvatar
        color={color}
        src={ picture || '' }
        size={`${width}`}
        name={name}
        textSizeRatio={2}
        round="1000px"
      />
      </div>
    </NavLink>
  )
})

export default NavLinkAvatar
