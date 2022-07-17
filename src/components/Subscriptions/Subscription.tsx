import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscriptionsStyles.js'
import { Paper } from '@material-ui/core'
import { ProfileType } from '../../types/types.js';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import { useDispatch } from 'react-redux';
import { createSubscription, deleteSubscription } from '../../redux/users_reducer';
import NavLinkAvatar from '../Common/NavLinkAvatar'

type SubscriptionPropsType = {
  subscribed: ProfileType
  currentUserUsername: string | null
}

const Subscription: React.FC<SubscriptionPropsType> = React.memo((props: SubscriptionPropsType) => {
  const classes = useStyles()
  const { subscribed, currentUserUsername } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const userPicture = subscribed.picture ? `${subscribed.picture.versions.cropped_small}` : ''
  const userFullName = `${subscribed.firstName} ${subscribed.lastName}`
  const userLink = `/i/${subscribed.username}`

  const subscription = subscribed.subscription
  const subscriptionButtonText = !!subscription
    ? t('Unsubscribe') : t('Subscribe')

  const [isProcessing, setIsProcessing] = useState(false)

  const handleClick = async () => {
    setIsProcessing(true)
    if (!subscription) {
      await dispatch(createSubscription(subscribed.id))
      setIsProcessing(false)
    } else {
      await dispatch(deleteSubscription(subscribed.id, subscription.id))
      setIsProcessing(false)
    }
  }

  return (
    <Paper className={classes.subscription} >
      <div className={classes.avatar}>
        <NavLinkAvatar
          width={60}
          picture={userPicture}
          name={userFullName}
          to={userLink}
        />
      </div>

      <div className={'grow'}>
        <div className={classes.userFullname}>
          <Typography
            component={NavLink}
            to={userLink}
            variant='subtitle2'
            color={"textPrimary"}
          >
            {userFullName}
          </Typography>
        </div>

        {currentUserUsername !== subscribed.username &&
          <ButtonWithCircularProgress
            variant='contained'
            color='secondary'
            enableProgress={isProcessing}
            disabled={isProcessing}
            onClick={handleClick}
            children={subscriptionButtonText}
          />
        }

      </div>
    </Paper>
  )
})

export default Subscription