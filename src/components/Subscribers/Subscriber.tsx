import React, { useState } from 'react'
import { NavLink, Redirect} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscribersStyles.js'
import { Avatar, Paper } from '@material-ui/core'
import { ProfileType } from '../../types/types.js';
import { imagesStorage } from '../../api/api';
import { useDispatch } from 'react-redux';
import { compose } from 'redux';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js';

type SubscriberPropsType = {
  subscriber: ProfileType
}

const Subscriber: React.FC<SubscriberPropsType> = React.memo((props: SubscriberPropsType) => {
  const classes = useStyles()
  const { subscriber } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const userPicture = subscriber.picture ? `${imagesStorage}/${subscriber.picture.versions.cropped_small}` : ''
  const userFullName = `${subscriber.firstName} ${subscriber.lastName}`
  const userLink = `/i/${subscriber.username}`

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
      </div>
    </Paper>
  )
})

export default compose(
  withRedirectToLogin
)(Subscriber);