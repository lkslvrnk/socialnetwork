import React, { FC, memo, useEffect, useState } from 'react';
import {makeStyles} from "@material-ui/core/styles";
import MyAvatarEditor from './MyAvatarEditor.js'
import MaterialAvatar from '@material-ui/core/Avatar';
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Badge, IconButton, Paper, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import PhotoCameraRoundedIcon from '@material-ui/icons/PhotoCameraRounded';
import { useSelector } from 'react-redux';
import { getProfilePicture } from '../../../redux/profile_selectors';
import EditIcon from '@material-ui/icons/Edit';
import { getFirstLetter } from '../../../helper/helperFunctionsTs';
// @ts-ignore
import ReactAvatar from 'react-avatar';

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
  userFirstName: string
  userLastName: string
}

const ProfileAvatar: FC<PropsType> = memo((props: PropsType) => {
  const { isOwnProfile, currentUserId, userFirstName, userLastName, profilePhotosAlbumId, onClick } = props
  
  const matches = useMediaQuery('(max-width: 860px)');
  const picture = useSelector(getProfilePicture)
  // @ts-ignore
  const pictureSrc: any = picture && picture.versions['cropped_original']

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

  const name = userFirstName + ' ' + userLastName
  const stc = require('string-to-color');
  const color = stc(name);

  // console.log(classes)

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
            size={matches ? '150' :'200'}
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
