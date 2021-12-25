import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'
import { ConnectionType } from '../../types/types';
import { Avatar, ClickAwayListener, IconButton, Typography } from '@material-ui/core';
import { imagesStorage } from '../../api/api';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import MenuListItemWithProgress from '../Common/MenuListItemWithProgress';
import PopperMenu2 from '../Common/PopperMenu2';
import { useStyles } from './ConnectionsStyles';

type AcceptedConnectionPropsType = {
  connection: ConnectionType
  handleDelete: Function
  isOwnProfile: boolean
}

const AcceptedConnection: React.FC<AcceptedConnectionPropsType> = React.memo((props: AcceptedConnectionPropsType) => {
  const classes = useStyles()

  const params: any = useParams()

  const {connection, handleDelete, isOwnProfile} = props

  const initiator = connection.initiator
  const target = connection.target
  const { t } = useTranslation()

  const isInitiator = connection.initiator.username === params.username

  const userPicture = isInitiator
    ? `${imagesStorage}/${target.picture}`
    : `${imagesStorage}/${initiator.picture}`
    
  const userFullName = isInitiator
    ? `${target.firstName} ${target.lastName}`
    : `${initiator.firstName} ${initiator.lastName}`

  const username = isInitiator ? target.username : initiator.username
  const userLink = `/i/${username}`

  const menuButton = useRef(null)
  const [menuAnchor, setMenuAnchor] = useState(null)

  const toggleMenu = (event: any) => {
    setMenuAnchor(prev => !!prev ? null : event.currentTarget)
  }

  const onClickAway = (event: any) => {
    if(event.target === menuButton.current) {
      event.stopPropagation()
      return
    }
    setMenuAnchor(null)
  }

  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const onDelete = async () => {
    setIsDeleting(true)
    await handleDelete(connection)
    setIsDeleting(false)
  }

  const contactDeleted = connection.deleted

  return (
    <div className={classes.connection} key={connection.id} >
      <Avatar
        component={NavLink} to={userLink}
        className={classes.avatar}
        src={userPicture}
      />

      <div className={classes.grow}>
        <div className={classes.nameAndMenu} >
          <Typography
            component={NavLink}
            to={userLink}
            variant='body2'
            color={contactDeleted ? "textSecondary" : "textPrimary"}
          >
            <b>{userFullName}</b>
          </Typography>
          
          { isOwnProfile && !contactDeleted &&
            <ClickAwayListener onClickAway={onClickAway} >
              <div>
              <IconButton size='small' onClick={toggleMenu} >
                <MoreHorizIcon ref={menuButton} />
              </IconButton>

              <PopperMenu2 dense open={!!menuAnchor} anchorEl={menuAnchor}>
                <MenuListItemWithProgress
                  children={'Delete from contacts'}
                  enableProgress={isDeleting}
                  progressSize={32}
                  onClick={onDelete}
                  disabled={isDeleting}
                />
              </PopperMenu2>
              </div>
            </ClickAwayListener>
          }
        </div>

        { contactDeleted &&
          <Typography variant='body2' color='textSecondary' >
            { t('Contact deleted') }
          </Typography>
        }
      </div>
    </div>
  )
})

export default AcceptedConnection