import React from 'react'
import { NavLink } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { useStyles } from './SubscribersStyles.js'
import { Paper } from '@material-ui/core'
import { ProfileType } from '../../types/types.js';
import { compose } from 'redux';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js';
import NavLinkAvatar from '../Common/NavLinkAvatar';

type SubscriberPropsType = {
  subscriber: ProfileType
}

const Subscriber: React.FC<SubscriberPropsType> = React.memo((props: SubscriberPropsType) => {
  const classes = useStyles()
  const { subscriber } = props

  const userPicture = subscriber.picture
    ? `${subscriber.picture.versions.cropped_small}` : ''
  const userFullName = `${subscriber.firstName} ${subscriber.lastName}`
  const userLink = `/i/${subscriber.username}`

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
        <div className={classes.userFullName}>
          <Typography
            component={NavLink}
            to={userLink}
            variant='subtitle2'
            color={"textPrimary"}
          >
            {userFullName}
          </Typography>
        </div>
      </div>
    </Paper>
  )
})

export default compose(
  withRedirectToLogin
)(Subscriber);