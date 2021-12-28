import React, { useEffect, useState } from 'react'
import { useParams} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscribersStyles.js'
import { List, ListItem, ListItemText, Paper } from '@material-ui/core'
import StickyPanel from '../Common/StickyPanel.js';
import { AppStateType } from '../../redux/redux_store.js';
import { actions } from '../../redux/users_reducer';
import { subscriptionAPI } from '../../api/subscription_api';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import Subscriber from './Subscriber';
import ConnectionSkeleton from '../Contacts/ConnectionSkeleton';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js';
import { compose } from 'redux';

const Subscriptions: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const subscribers = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)

  const [moreSubscribersLoading, setMoreSubscribesLoading] = useState(false)
  const params: any = useParams()

  const usernameFromParams = params.username
  const currentUserUsername: string | null = useSelector(getCurrentUserUsername)
  const isOwnSubscriptions = currentUserUsername === usernameFromParams

  const componentName = 'subscriptions'

  useEffect(() => {
    (async function() {
      dispatch(actions.setComponentName(componentName))
      try {
        let response = await subscriptionAPI.getSubscribersOfUser(params.username, 10, null)
        let data = response.data
        dispatch(actions.setUsers(data.subscribers, data.allCount, data.cursor, componentName))
      } catch(error) {
        console.log(error)
      }
    })()
    document.title = t('Subscribers')
    return () => {
      (function() { dispatch(actions.clean()) })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMoreSubscribers = async () => {
    if(!moreSubscribersLoading && cursor) {
      setMoreSubscribesLoading(true)
      try {
        let response = await subscriptionAPI.getSubscribersOfUser(params.username, 10, cursor)
        let data = response.data
        dispatch(actions.addUsers(data.subscribers, data.allCount, data.cursor, componentName))
      } catch(error) {
        console.log(error)
      } finally {
        setMoreSubscribesLoading(false)
      }
    }
  }

  const panel = <div className={classes.panel}>
    <StickyPanel top={55}>
      <Paper style={{width: 300}}>
      </Paper>
    </StickyPanel>
  </div>

  if(!!subscribers && !subscribers.length) {
    return <section className={classes.subscriptions}>
      <Paper className={classes.noSubscriptions} >
        <div style={{ fontSize: '130px' }}>
          🐮
        </div>

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

  let subscribersList = subscribers && subscribers.map(subscriber => {
    return <Subscriber
      key={subscriber.id}
      subscriber={subscriber}
    />
  })

  let skeletons = [1,2,3].map(skeleton => {
    return <Paper><ConnectionSkeleton /></Paper>
  })

  return <section className={classes.subscriptions}>
    <main className={classes.subscriptionsList}>
      { !!subscribers
        ? subscribersList
        : <>{skeletons}</>
      }
      { !!subscribers && !!cursor &&
        <div className={classes.loadMore} >
          <ButtonWithCircularProgress
            enableProgress={moreSubscribersLoading}
            disabled={moreSubscribersLoading}
            variant='contained'
            onClick={ handleLoadMoreSubscribers }
            children={ t('Load more')}
          />
        </div>
      }
    </main>
    { panel }
  </section>

})

export default compose(
  withRedirectToLogin
)(Subscriptions);
