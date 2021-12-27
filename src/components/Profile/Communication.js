import React, { useState } from 'react';
import { createSubscription, deleteSubscription } from '../../redux/profile_reducer'
import { createConnection, deleteConnection, acceptConnection } from '../../redux/profile_reducer';
import { Button, useMediaQuery} from '@material-ui/core';
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

const Communication = React.memo(props => {

  const {currentUserId, profile, profileLoaded} = props

  const mobile = useMediaQuery('(max-width: 860px)')
  const classes = useStyles({ 'matches800': true })

  const dispatch = useDispatch()
  
  const { t } = useTranslation()

  const [connectionActionInProgress, setConnectionActionInProgress] = useState(false)
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

  const connectRequest = async () => {
    if(!connection) {
      return dispatch(createConnection(profile.id))
    }
    else if(!!connection && !areConnected && currentUserInitiatorOfConnection) {
      return dispatch(deleteConnection(connection.id))
    }
    else if(!!connection && !areConnected && ownerOfProfileInitiatorOfConnection) {
      return dispatch(acceptConnection(connection.id))
    }
    else if(!!connection && areConnected) {
      return dispatch(deleteConnection(connection.id))
    }
    return null
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

  const onConnectButtonClick = () => {
    if(connectionActionInProgress) {
      return
    }
    setConnectionActionInProgress(true)
    connectRequest()
      .then(() => setConnectionActionInProgress(false), () => setConnectionActionInProgress(false))
  }

  const onSubscriptionButtonClick = () => {
    if(subscriptionActionInProgress) {
      return
    }
    setSubscriptionActionInProgress(true)
    subscriptionRequest()
      .then(() => setSubscriptionActionInProgress(false), () => setSubscriptionActionInProgress(false))
  }

  let connectButtonTitle = ''
  let tooltipTitle = ''

  if(!!connection && areConnected) {
    connectButtonTitle = t('Delete from contacts')
  }
  else if(Boolean(connection) && !areConnected && currentUserInitiatorOfConnection) {
    connectButtonTitle = t('Cancel request')
    tooltipTitle = t('You offered to set up a contact, press if you want to cancel')
  }
  else if(Boolean(connection) && !areConnected && ownerOfProfileInitiatorOfConnection) {
    connectButtonTitle = t('Accept request')
    tooltipTitle = t('You have been offered to set up a contact, press if you want to refuse')
  }
  else if(!Boolean(connection)) {
    connectButtonTitle = t('Offer contact')
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
          style={{width: '100%'}}
        />

        <Tooltip  title={tooltipTitle} arrow>
          <ButtonWithCircularProgress
            variant='contained'
            startIcon={<PersonAddIcon />}
            children={connectButtonTitle}
            onClick={onConnectButtonClick}
            enableProgress={connectionActionInProgress}
            disabled={connectionActionInProgress}
            style={{width: '100%'}}
          />
        </Tooltip>
    </div>
  )
  
})

export default Communication