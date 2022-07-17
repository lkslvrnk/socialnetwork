import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionType, } from '../../types/types';
import { Badge, Typography } from '@material-ui/core';
import { useStyles } from './ConnectionsStyles';
import TypographyLink from '../Common/TypographyLink';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';
import { checkRequests } from '../../redux/auth_reducer';
import { AppStateType } from '../../redux/redux_store';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserId } from '../../redux/auth_selectors';
import NavLinkAvatar from '../Common/NavLinkAvatar';

type IncomingConnectionPropsType = {
  connection: ConnectionType
  handleAccept: Function
  handleDelete: Function
  lastRequestsCheck: number
}

const IncomingConnection: React.FC<IncomingConnectionPropsType> = React.memo((props: IncomingConnectionPropsType) => {
  const {connection, handleAccept, handleDelete} = props
  const { t } = useTranslation()
  const classes = useStyles()

  const initiator = connection.initiator
  const userPicture = `${initiator.picture}`
  const userFullName = `${initiator.firstName} ${initiator.lastName}`
  const userLink = `/i/${initiator.username}`

  const [isAccepting, setIsAccepting] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const lastRequestsCheck2 = useSelector((state: AppStateType) => state.auth.lastRequestsCheck)
  const lastRequestsCheckRef = useRef(lastRequestsCheck2)
  const currentUserId: string | null = useSelector(getCurrentUserId)
  const dispatch = useDispatch()

  useEffect(() => {
    if(currentUserId) {
      dispatch(checkRequests(currentUserId))
    }
  }, [dispatch, currentUserId])

  const onAccept = async () => {
    setIsAccepting(true)
    try {
      await handleAccept(connection)
    } catch(err) {
    } finally {
      setIsAccepting(false)
    }
  }

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      await handleDelete(connection, 'incoming')
    } catch(err) {
    } finally {
      setIsDeleting(false)
    }
  }

  let isNew = connection.createdAt > lastRequestsCheckRef.current

  return (
    <div
      className={classes.connection}
      key={connection.id}
    >
      <Badge
        badgeContent={isNew ? 'new' : 0}
        color='primary'
        overlap="circular"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className={classes.avatar}>
          <NavLinkAvatar
            width={80}
            picture={userPicture}
            name={userFullName}
            to={userLink}
          />
        </div>
      </Badge>

      <div className='grow'>
        <div className={classes.nameAndMenu}>
          <TypographyLink
            variant='subtitle2'
            to={userLink}
            children={userFullName}
          />
        </div>

        { connection.isAccepted &&
          <Typography variant='body2' color='textSecondary'>
            {t('You are connected')}
          </Typography>
        }
        { connection.deleted &&
          <Typography variant='body2' color='textSecondary'>
            {t('You rejected connection')}
          </Typography>
        }
        { !connection.isAccepted && !connection.deleted &&
          <div className={classes.buttons}>
            <div style={{marginRight: 16}} >
              <ButtonWithCircularProgress
                disableElevation
                disabled={isAccepting}
                variant='contained'
                onClick={onAccept}
                children={t('Accept')}
                enableProgress={isAccepting}
              />
            </div>
            <div>
              <ButtonWithCircularProgress
                disableElevation
                variant='contained'
                color='secondary'
                onClick={onDelete}
                children={t('Reject')}
                enableProgress={isDeleting}
              />
            </div>
          </div>
        }
      </div>
    </div>
  )
})

export default IncomingConnection