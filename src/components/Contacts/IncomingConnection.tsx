import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { ConnectionType, } from '../../types/types';
import { Avatar, Button, CircularProgress, Typography } from '@material-ui/core';
import { imagesStorage } from '../../api/api';
import { useStyles } from './ConnectionsStyles';
import TypographyLink from '../Common/TypographyLink';

type IncomingConnectionPropsType = {
  connection: ConnectionType
  handleAccept: Function
  handleDelete: Function
}

const IncomingConnection: React.FC<IncomingConnectionPropsType> = React.memo((props: IncomingConnectionPropsType) => {
  const {connection, handleAccept, handleDelete} = props
  const { t } = useTranslation()
  const classes = useStyles()

  const initiator = connection.initiator
  const userPicture = `${imagesStorage}${initiator.picture}`
  const userFullName = `${initiator.firstName} ${initiator.lastName}`
  const userLink = `/i/${initiator.username}`

  const [isAccepting, setIsAccepting] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const onAccept = async () => {
    setIsAccepting(true)
    try {
      await handleAccept(connection)
    } catch(err) {
      console.log('Connection не было подтверждено', err)
    } finally {
      setIsAccepting(false)
    }
  }

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      await handleDelete(connection, 'incoming')
    } catch(err) {
      console.log('Connection не было удалено', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={ classes.connection } key={connection.id} >
      <Avatar
        component={NavLink}
        to={userLink}
        className={classes.avatar}
        src={userPicture}
      />

      <div style={{flexGrow: 1}}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <TypographyLink variant='body2' to={userLink} style={{marginBottom: 8}} children={<b>{ userFullName }</b>} />
        </div>

        { connection.isAccepted &&
          <Typography variant='body2' color='textSecondary'>{t('You are connected')}</Typography>
        }
        { connection.deleted &&
          <Typography variant='body2' color='textSecondary'>{t('You rejected connection')}</Typography>
        }

        { !connection.isAccepted && !connection.deleted &&
          <div style={{ display: 'flex' }}>
            <div className={classes.buttonWrapper} style={{marginRight: 16}} >
              <Button disabled={isAccepting} variant='contained' onClick={ onAccept } >
                {t('Accept')}
              </Button>
              {isAccepting && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>

            <div className={classes.buttonWrapper} >
              <Button variant='contained' color='secondary' onClick={ onDelete } >
                {t('Reject')}
              </Button>
              {isDeleting && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
          </div>
        }
      </div>
    </div>
  )
})

export default IncomingConnection