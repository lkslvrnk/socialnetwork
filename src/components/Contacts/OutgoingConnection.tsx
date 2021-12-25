import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { ConnectionType } from '../../types/types';
import { Avatar, Button, CircularProgress,Typography } from '@material-ui/core';
import { imagesStorage } from '../../api/api';
import { useStyles } from './ConnectionsStyles';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';

type OutgoingConnectionPropsType = {
  connection: ConnectionType
  handleDelete: Function
}

const OutgoingConnection: React.FC<OutgoingConnectionPropsType> = React.memo((props: OutgoingConnectionPropsType) => {
  const classes = useStyles()

  const {connection, handleDelete} = props
  const { t } = useTranslation()
  
  const target = connection.target
  const userPicture = `${imagesStorage}${target.picture}`
  const userFullName = `${target.firstName} ${target.lastName}`
  const userLink = `/i/${target.username}`

  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const onDelete = async () => {
    setIsDeleting(true)
    await handleDelete(connection, 'outgoing')
    setIsDeleting(false)
  }

  return (
    <div className={ classes.connection } key={connection.id} >
      <Avatar
        component={NavLink}
        to={userLink}
        className={classes.avatar}
        src={userPicture}
      />

      <div className={classes.grow} >
        <div className={classes.nameAndMenu}>
          <Typography
            color='textPrimary'
            component={NavLink}
            to={userLink}
            variant='body2'
            children={<b>{ userFullName }</b>}
          />
        </div>

        { connection.deleted ?
          t('Request canceled')
          :
          <ButtonWithCircularProgress
            enableProgress={isDeleting}
            variant='contained'
            disabled={isDeleting}
            onClick={onDelete}
            children={t('Cancel')}
          />
        }
      </div>
    </div>
  )
})

export default OutgoingConnection