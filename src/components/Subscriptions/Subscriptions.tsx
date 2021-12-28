import React, { useEffect, useState } from 'react'
import { useParams} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscriptionsStyles.js'
import { List, ListItem, ListItemText, Paper } from '@material-ui/core'
import Preloader from '../Common/Preloader/Preloader.jsx';
import StickyPanel from '../Common/StickyPanel.js';
import { AppStateType } from '../../redux/redux_store.js';
import { actions } from '../../redux/users_reducer';
import { subscriptionAPI } from '../../api/subscription_api';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import Subscription from './Subscription';
import ConnectionSkeleton from '../Contacts/ConnectionSkeleton';

const Subscriptions: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const subscriptions = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)

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

  let subscriptionsList = subscriptions && subscriptions.map(subscribed => {
    return <Subscription key={subscribed.id} subscribed={subscribed} />
  })

  let skeletons = [1,2,3].map(skeleton => {
    return <Paper><ConnectionSkeleton /></Paper>
  })

  return <section className={classes.subscriptions}>
    <main className={classes.subscriptionsList}>
      { !!subscriptions
        ? subscriptionsList
        : <>{skeletons}</>
      }
      { !!subscriptions && !!cursor &&
        <div className={classes.loadMore} >
          <ButtonWithCircularProgress
            enableProgress={moreSubscriptionsLoading}
            disabled={moreSubscriptionsLoading}
            variant='contained'
            onClick={ handleLoadMoreSubscriptions }
            children={ t('Load more')}
          />
        </div>
      }
    </main>
    { panel }
  </section>

})

export default Subscriptions
