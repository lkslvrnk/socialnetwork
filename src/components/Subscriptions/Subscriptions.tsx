import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useParams} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscriptionsStyles.js'
import { Avatar, Button, List, ListItem, ListItemText, Paper } from '@material-ui/core'
import Preloader from '../Common/Preloader/Preloader.jsx';
import StickyPanel from '../Common/StickyPanel.js';
import { AppStateType } from '../../redux/redux_store.js';
import { ProfileType } from '../../types/types.js';
import { imagesStorage } from '../../api/api';
import { actions } from '../../redux/users_reducer';
import { subscriptionAPI } from '../../api/subscription_api';
import { getCurrentUserUsername } from '../../redux/auth_selectors';

const Subscriptions: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const subscriptions = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)
  const loadMoreButton = useRef(null)
  const [moreSubscriptionsLoading, setMoreSubscriptionsLoading] = useState(false)
  const params: any = useParams()

  const usernameFromParams = params.username
  const currentUserUsername: string | null = useSelector(getCurrentUserUsername)
  const isOwnSubscriptions = currentUserUsername === usernameFromParams

  useEffect(() => {
    (async function() {
      try {
        let response = await subscriptionAPI.getSubscriptionsfUser(params.username, 10, null)
        let data = response.data
        dispatch(actions.setUsers(data.subscriptions, data.allCount, data.cursor))
      } catch(error) {
        console.log(error)
      }
    })()
    document.title = t('Subscriptions')
    return () => {
      (function() { dispatch(actions.clean()) })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMoreSubscriptions = async () => {
    if(!moreSubscriptionsLoading && cursor) {
      setMoreSubscriptionsLoading(true)
      try {
        let response = await subscriptionAPI.getSubscriptionsfUser(params.username, 10, cursor)
        let data = response.data
        dispatch(actions.addUsers(data.subscriptions, data.allCount, data.cursor))
      } catch(error) {
        console.log(error)
      } finally {
        setMoreSubscriptionsLoading(false)
      }
    }
  }

  const panel = <div className={classes.panel}>
    <StickyPanel top={55}>
      <Paper style={{width: 300}}>
        <List dense component="nav" >
          <ListItem
            button
            selected={true}
          >
            <ListItemText primary={t(`People`)} />
          </ListItem>
        </List>
      </Paper>
    </StickyPanel>
  </div>

  if(!!subscriptions && !subscriptions.length) {
    return <section className={classes.subscriptions}>
      <Paper style={{flexGrow: 1, display: 'flex', justifyContent: 'center', marginRight: 16}}>
        <div style={{ fontSize: '130px' }}>🐮</div>
        <Typography variant='h6' >
          { isOwnSubscriptions
            ? t("You have no subscriptions")
            : t("User has no subscriptions")
          }
        </Typography>
      </Paper>
      { panel }
    </section>
  }

  let subscriptionsList = subscriptions && subscriptions.map(subscribed => {
    return <Subscription key={subscribed.id} subscribed={subscribed} />
  })

  return <section className={classes.subscriptions}>
    <main className={classes.subscriptionsList}>
      { !!subscriptions
        ? subscriptionsList
        : <Preloader />
      }
      <div style={{display: 'flex', justifyContent: 'center'}} ref={loadMoreButton} >
        { !!subscriptions && !!cursor &&
          <div style={{ position: 'relative'}}>
            <Button onClick={ handleLoadMoreSubscriptions } >Загрузить ещё</Button>   
            <div style={{position: 'absolute', top: 0, right:0, left:0, bottom: 0, display: moreSubscriptionsLoading ? 'block' : 'none' }}><Preloader /></div>
          </div>
        }
      </div>
    </main>
    { panel }
  </section>

})

type SubscriptionPropsType = {
  subscribed: ProfileType
}

const Subscription: React.FC<SubscriptionPropsType> = React.memo((props: SubscriptionPropsType) => {
  const classes = useStyles()
  const { subscribed } = props
  const { t } = useTranslation()

  const userPicture = subscribed.picture ? `${imagesStorage}/${subscribed.picture.versions.cropped_small}` : ''
  const userFullName = `${subscribed.firstName} ${subscribed.lastName}`
  const userLink = `/i/${subscribed.username}`

  const subscription = subscribed.subscription
  const subscriptionButtonText = !!subscription
    ? t('Unsubscribe') : t('Subscribe')

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

        <Button variant='contained'>
          { subscriptionButtonText }
        </Button>
      </div>
    </Paper>
  )
})

export default Subscriptions
