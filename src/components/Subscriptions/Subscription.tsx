import React, { useState } from 'react'
import { NavLink} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscriptionsStyles.js'
import { Avatar, Button, Paper } from '@material-ui/core'
import { ProfileType } from '../../types/types.js';
import { imagesStorage } from '../../api/api';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import { useDispatch } from 'react-redux';
import { createSubscription, deleteSubscription } from '../../redux/users_reducer';

type SubscriptionPropsType = {
  subscribed: ProfileType
}

const Subscription: React.FC<SubscriptionPropsType> = React.memo((props: SubscriptionPropsType) => {
  const classes = useStyles()
  const { subscribed } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const userPicture = subscribed.picture ? `${imagesStorage}/${subscribed.picture.versions.cropped_small}` : ''
  const userFullName = `${subscribed.firstName} ${subscribed.lastName}`
  const userLink = `/i/${subscribed.username}`

  const subscription = subscribed.subscription
  const subscriptionButtonText = !!subscription
    ? t('Unsubscribe') : t('Subscribe')

  const [isProcessing, setIsProcessing] = useState(false)

  const handleClick = async () => {
    setIsProcessing(true)
    if(!subscription) {
      await dispatch(createSubscription(subscribed.id))
      setIsProcessing(false)
    } else {
      await dispatch(deleteSubscription(subscribed.id, subscription.id))
      setIsProcessing(false)
    }
  }

  return (
    <Paper className={ classes.subscription } >
      <Avatar
        component={ NavLink }
        to={ userLink }
        className={ classes.avatar }
        src={ userPicture }
      />

      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            component={NavLink}
            to={userLink}
            variant='body2'
            style={{ marginBottom: 8 }}
            color={ "textPrimary" }
          >
            <b>{ userFullName }</b>
          </Typography>
        </div>

        <ButtonWithCircularProgress
          variant='contained'
          color='secondary'
          enableProgress={isProcessing}
          disabled={isProcessing}
          onClick={handleClick}
          children={subscriptionButtonText}
        />

      </div>
    </Paper>
  )
})

export default Subscription
