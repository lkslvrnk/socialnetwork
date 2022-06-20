import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { getFirstLetter } from '../../helper/helperFunctionsTs';

const CustomAvatarGroup = React.memo(props => {
  const { usersData, width, total } = props

  return <AvatarGroup
    max={5}
    total={total}
    sx={{
      '.MuiAvatar-root': { width: width, height: width, fontSize: 15, lineHeight: 2, borderWidth: 0 },
    }}
  >
    { usersData.map(user => {
      let link = `/i/${user.username}`
      let picture = user.picture ? user.picture.src : null

      const subName = `${user.firstName} ${user.lastName}`
      const stc = require('string-to-color');
      const background = stc(subName);
      const splittedName = subName.split(' ')
      const letters = `${getFirstLetter(splittedName[0])}${getFirstLetter(splittedName[1])}`

      return <Avatar
        key={user.id}
        component={NavLink}
        to={{
          pathname: link,
          state: {firstName: user.firstName, lastName: user.lastName}
        }}
        style={{background, fontSize: 15 }}
        src={picture}
        children={letters}
        title={subName}
      />
    })}
  </AvatarGroup>

})

export default CustomAvatarGroup
