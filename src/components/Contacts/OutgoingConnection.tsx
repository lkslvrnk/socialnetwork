import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { ConnectionType } from '../../types/types';
import { Typography } from '@material-ui/core';
import { useStyles } from './ConnectionsStyles';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';
import NavLinkAvatar from '../Common/NavLinkAvatar';

type OutgoingConnectionPropsType = {
  connection: ConnectionType
  handleDelete: Function
}

const OutgoingConnection: React.FC<OutgoingConnectionPropsType> = React.memo((props: OutgoingConnectionPropsType) => {
  const classes = useStyles()

  const {connection, handleDelete} = props
  const { t } = useTranslation()
  
  const target = connection.target
  const userPicture = `${target.picture}`
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
      <div className={classes.avatar}>
        <NavLinkAvatar
          width={80}
          picture={userPicture}
          name={userFullName}
          to={userLink}
        />
      </div>

      <div className='grow' >
        <div className={classes.nameAndMenu}>
          <Typography
            color='textPrimary'
            component={NavLink}
            to={userLink}
            variant='subtitle2'
            children={userFullName}
          />
        </div>

        { connection.deleted
          ?
          <Typography variant='body2'>
            {t('Request canceled')}
          </Typography>
          :
          <ButtonWithCircularProgress
            disableElevation
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