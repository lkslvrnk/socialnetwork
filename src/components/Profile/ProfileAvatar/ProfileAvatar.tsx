import React, { FC, memo, useEffect, useState } from 'react';
import {makeStyles} from "@material-ui/core/styles";
import MyAvatarEditor from './MyAvatarEditor.js'
import MaterialAvatar from '@material-ui/core/Avatar';
import { Link, useLocation } from 'react-router-dom'
import { Badge, IconButton, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import PhotoCameraRoundedIcon from '@material-ui/icons/PhotoCameraRounded';
import { useSelector } from 'react-redux';
import { getProfilePicture } from '../../../redux/profile_selectors';
import { imagesStorage } from '../../../api/api';
import EditIcon from '@material-ui/icons/Edit';

export const useStyles = makeStyles(theme => ({
  container: {
    padding: '5px',
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {},
  },
  avatar: {
    height: 200,
    width: 200,
    '@media (max-width: 860px)': {
      height: 150,
      width: 150,
    },
    border: `6px solid ${theme.palette.background.default}`
  },
  editButtonRoot: {
    borderRadius: 100,
    background: theme.palette.background.paper,
    border: `2px solid ${theme.palette.divider}`
  }
}))

type PropsType = {
  avatar: any
  isOwnProfile: boolean
  currentUserId: any
  profilePhotosAlbumId: string
  onClick: Function
}

const ProfileAvatar: FC<PropsType> = memo((props: PropsType) => {
  const { isOwnProfile, currentUserId, profilePhotosAlbumId, onClick } = props
  
  const picture = useSelector(getProfilePicture)
  // @ts-ignore
  const pictureSrc: any = picture && `${imagesStorage}${picture.versions['cropped_large']}`

  const classes = useStyles({ avatar: picture });
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  let location = useLocation()

  useEffect(() => {
    if(showAvatarEditor) setShowAvatarEditor(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picture])

  let handleOpenEditor = () => {  
    if(isOwnProfile) setShowAvatarEditor(true)
  }

  let handleClick = () => {
    if(!!picture) {
      onClick()
    }
  }

  return (
    <>
      <Badge 
        badgeContent={
          isOwnProfile ?
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
        overlap="circle"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MaterialAvatar
          src={ pictureSrc }
          className={classes.avatar}
          style={{cursor: !!picture ? 'pointer' : 'default'}}
          onClick={handleClick}
        />
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
