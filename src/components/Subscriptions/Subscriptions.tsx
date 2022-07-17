import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscriptionsStyles.js'
import { List, ListItem, ListItemText, Paper } from '@material-ui/core'
import StickyPanel from '../Common/StickyPanel.js';
import { AppStateType } from '../../redux/redux_store.js';
import { actions } from '../../redux/users_reducer';
import { subscriptionAPI } from '../../api/subscription_api';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import Subscription from './Subscription';
import ConnectionSkeleton from '../Contacts/ConnectionSkeleton';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js';
import { compose } from 'redux';
import { profileAPI } from '../../api/profile_api';
import { ProfileType } from '../../types/types.js';
import ProfileNotFound from '../Common/ProfileNotFound.js';
import { usePrevious } from '../../hooks/hooks.js';
import EmptyListStub from '../Common/EmptyListStub';

const Subscriptions: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const subscriptions = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)

  const [moreSubscriptionsLoading, setMoreSubscriptionsLoading] = useState(false)
  const params: any = useParams()

  const usernameFromParams = params.username
  const previousUsernameFromParams = usePrevious(usernameFromParams)
  const currentUserUsername: string | null = useSelector(getCurrentUserUsername)
  const isOwnSubscriptions = currentUserUsername === usernameFromParams

  const componentName = 'subscriptions'

  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  function getUser() {
    profileAPI.getUser(usernameFromParams)
      .then(
        (response) => {
          if (response.status === 200) {
            setProfile(response.data)
            setProfileLoaded(true)
          }
        },
        error => {
          if (error.response && error.response.status === 404) {
            setProfileLoaded(true)
          }
        }
      )
  }

  useEffect(() => {
    getUser()
    document.title = t('Subscriptions')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (profileLoaded && !!profile) {
      (async function () {
        dispatch(actions.setComponentName(componentName))
        try {
          let response = await subscriptionAPI.getSubscriptionsfUser(params.username, 10, null)
          let data = response.data
          dispatch(actions.setUsers(data.subscriptions, data.allCount, data.cursor, componentName))
        } catch (error) {
          // console.log(error)
        }
      })()
      return () => {
        (function () { dispatch(actions.clean()) })()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded])

  useEffect(() => {
    (async function () {
      if (previousUsernameFromParams !== undefined && usernameFromParams !== previousUsernameFromParams) {
        setProfile(null)
        setProfileLoaded(false)
        dispatch(actions.clean())
        getUser()
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromParams])

  if (profileLoaded && !profile) {
    return <ProfileNotFound />
  }

  const handleLoadMoreSubscriptions = async () => {
    if (!moreSubscriptionsLoading && cursor) {
      setMoreSubscriptionsLoading(true)
      try {
        let response = await subscriptionAPI.getSubscriptionsfUser(params.username, 10, cursor)
        let data = response.data
        dispatch(actions.addUsers(data.subscriptions, data.allCount, data.cursor, componentName))
      } catch (error) {
        // console.log(error)
      } finally {
        setMoreSubscriptionsLoading(false)
      }
    }
  }

  const panel = <div className={'aside-content'}>
    <StickyPanel top={55}>
      <Paper style={{ width: 300 }}>
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

  if (!!subscriptions && !subscriptions.length) {
    return <section className={'content'}>
      <Paper className={classes.noSubscriptions} >

        <EmptyListStub
          imageSrc='/images/animals/panda.png'
          containerWidth={150}
          containerHeight={150}
          text={isOwnSubscriptions
            ? t("empty own subscriptions")
            : t("User has no subscriptions")
          }
        />
      </Paper>
      {panel}
    </section>
  }

  let subscriptionsList = subscriptions && subscriptions.map(subscribed => {
    return <Subscription
      key={subscribed.id}
      subscribed={subscribed}
      currentUserUsername={currentUserUsername}
    />
  })

  let skeletons = [1, 2, 3].map((skeleton, index) => {
    return <Paper key={index} ><ConnectionSkeleton /></Paper>
  })

  return <section className={'content'}>
    <main className={classes.subscriptionsList}>
      {!!profile && !!subscriptions && subscriptions.length > 0 &&
        <Paper style={{ padding: 16 }}>
          <Typography variant='subtitle2' >
            {isOwnSubscriptions
              ? `${t('My subscriptions')}`
              : `${t('Subscriptions of')} ${profile.firstName} ${profile.lastName}`
            }
          </Typography>
        </Paper>
      }
      {!!subscriptions
        ? subscriptionsList
        : <>{skeletons}</>
      }
      {!!subscriptions && !!cursor &&
        <div className={classes.loadMore} >
          <ButtonWithCircularProgress
            enableProgress={moreSubscriptionsLoading}
            disabled={moreSubscriptionsLoading}
            variant='contained'
            onClick={handleLoadMoreSubscriptions}
            children={t('Load more')}
          />
        </div>
      }
    </main>
    {panel}
  </section>

})

export default compose(
  withRedirectToLogin
)(Subscriptions);
