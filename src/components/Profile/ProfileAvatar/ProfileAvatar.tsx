import React, { FC, memo, useEffect, useState } from 'react';
import MyAvatarEditor from '../AvatarEditor/MyAvatarEditor'
import { Badge, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getProfilePicture } from '../../../redux/profile_selectors';
import EditIcon from '@material-ui/icons/Edit';
// @ts-ignore
import ReactAvatar from 'react-avatar';
import { useStyles } from './ProfileAvatarStyles';

type PropsType = {
  avatar: any
  isOwnProfile: boolean
  currentUserId: any
  profilePhotosAlbumId: string
  onClick: Function
  userFirstName: string
  userLastName: string
  size: number
  showEditButton: boolean
}

const ProfileAvatar: FC<PropsType> = memo((props: PropsType) => {
  const { isOwnProfile, currentUserId, userFirstName, userLastName, onClick, size, showEditButton } = props
  
  const picture = useSelector(getProfilePicture)
  // @ts-ignore
  const pictureSrc: any = picture && picture.versions['cropped_original']

  const classes = useStyles()
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)

  useEffect(() => {
    if(showAvatarEditor) setShowAvatarEditor(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picture])

  let handleOpenEditor = () => {  
    if(isOwnProfile) setShowAvatarEditor(true)
  }

  let handleClick = () => {
    if(!!picture) onClick()
  }

  const name = userFirstName + ' ' + userLastName
  const stc = require('string-to-color');
  const color = stc(name);

  return (
    <>
      <Badge 
        badgeContent={
          showEditButton
            ?
            <div className={classes.editButtonRoot}>
              <IconButton
                size='small'
                onClick={handleOpenEditor}
              >
                <EditIcon />
              </IconButton>
            </div>
            :
            null
        }
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <div
          style={{cursor: pictureSrc ? 'pointer' : 'default'}}
          onClick={handleClick}
        >
          <ReactAvatar
            color={color}
            src={ pictureSrc }
            size={`${size}`}
            name={name}
            textSizeRatio={2}
            round="1000px"
          />
        </div>

      </Badge>

      <MyAvatarEditor 
        currentUserId={currentUserId} 
        show={showAvatarEditor} 
        setShow={setShowAvatarEditor}
      />
    </>
  )
})

export default ProfileAvatar
