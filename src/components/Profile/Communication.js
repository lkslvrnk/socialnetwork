import React, { useState } from 'react';
import { createSubscription, deleteSubscription } from '../../redux/profile_reducer'
import { createConnection, deleteConnection, acceptConnection } from '../../redux/profile_reducer';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, useMediaQuery} from '@material-ui/core';
import Preloader from '../Common/Preloader/Preloader.jsx';
import MessageIcon from '@material-ui/icons/Message';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from '@material-ui/lab/Skeleton';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../../redux/profile_selectors';
import { useParams } from 'react-router-dom';
import { useStyles } from './ProfileStyles';
import { useTranslation } from 'react-i18next';
import EditIcon from '@material-ui/icons/Edit';
import ConnectionAction from '../Common/ConnectionAction';

const Communication = React.memo(props => {

  const {currentUserId, profile, profileLoaded} = props

  const mobile = useMediaQuery('(max-width: 860px)')
  const classes = useStyles({ 'matches800': true })

  const dispatch = useDispatch()
  
  const { t } = useTranslation()

  const [subscriptionActionInProgress, setSubscriptionActionInProgress] = useState(false)

  let buttonsSectionClass = mobile
    ? classes.buttonsSectionMobile : classes.buttonsSection

  if(!profileLoaded) {
    return (
      <div className={buttonsSectionClass}>
        { [150, 120, 170].map(width => {
          return (
            <div>
              <Skeleton
                className={classes.buttonSkeleton}
                variant='rect'
                width={'100%'}
                height={36}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const connection = profile.connection
  const areConnected = connection && connection.isAccepted
  const currentUserInitiatorOfConnection = connection && connection.initiator.id === currentUserId
  const ownerOfProfileInitiatorOfConnection = connection && connection.initiator.id === profile.id

  const onCreateConnection = (subscribe) => {
    if(!!profile) {
      return dispatch(createConnection(profile.id, subscribe))
    }
  }

  const onDeleteConnection = () => {
    if(!!connection) {
      return dispatch(deleteConnection(connection.id))
    }
  }

  const onAcceptConnection = () => {
    if(!!connection) {
      return dispatch(acceptConnection(connection.id))
    }
  }

  const onRejectConnection = () => {
    if(!!connection) {
      return dispatch(deleteConnection(connection.id))
    }
  }

  const subscription = profile.subscription

  const subscriptionRequest = async () => {
    if(!subscription) {
      return dispatch(createSubscription(profile.id))
    }
    else {
      return dispatch(deleteSubscription(subscription.id))
    }
  }
  const onSubscriptionButtonClick = () => {
    if(subscriptionActionInProgress) {
      return
    }
    setSubscriptionActionInProgress(true)
    subscriptionRequest()
      .then(() => setSubscriptionActionInProgress(false), () => setSubscriptionActionInProgress(false))
  }


  let subscribeButtonTitle = ''
  if(!!subscription) {
    subscribeButtonTitle = t('Unsubscribe')
  } else {
    subscribeButtonTitle = t('Subscribe')
  }

  return (
    <div className={buttonsSectionClass} >
      <Button color='primary' variant="contained" startIcon={<MessageIcon />}>
        {t('Message')}
      </Button>

        <ButtonWithCircularProgress
          color='secondary' variant='contained'
          children={subscribeButtonTitle}
          onClick={onSubscriptionButtonClick}
          enableProgress={subscriptionActionInProgress}
          disabled={subscriptionActionInProgress}
        />

        <ConnectionAction
          areConnected={areConnected}
          offerReceived={ownerOfProfileInitiatorOfConnection}
          offerSent={currentUserInitiatorOfConnection}
          onCreate={onCreateConnection}
          onAccept={onAcceptConnection}
          onReject={onRejectConnection}
          onDelete={onDeleteConnection}
        />

    </div>
  )
  
})

export default Communication