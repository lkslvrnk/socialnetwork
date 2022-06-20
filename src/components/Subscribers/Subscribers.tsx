import React, { useEffect, useState } from 'react'
import { NavLink, useParams} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SubscribersStyles.js'
import { Paper } from '@material-ui/core'
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
import { profileAPI } from '../../api/profile_api';
import { ProfileType } from '../../types/types.js';
import ProfileNotFound from '../Common/ProfileNotFound.js';
import { usePrevious } from '../../hooks/hooks.js';
import EmptyListStub from '../Common/EmptyListStub';

const Subscriptions: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const subscribers = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)
  const totalCount = useSelector((state: AppStateType) => state.users.totalCount)

  const [profile, setProfile] = useState<ProfileType|null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const [moreSubscribersLoading, setMoreSubscribesLoading] = useState(false)
  const params: any = useParams()

  const usernameFromParams = params.username
  const previousUsernameFromParams = usePrevious(usernameFromParams)
  const currentUserUsername: string | null = useSelector(getCurrentUserUsername)
  const isOwnSubscriptions = currentUserUsername === usernameFromParams

  const componentName = 'subscriptions'

  function getUser() {
    profileAPI.getUser(usernameFromParams)
      .then(
        (response) => {
          if(response.status === 200) {
            setProfile(response.data)
            setProfileLoaded(true)
          }
        },
        error => {
          if(error.response) {
            if(error.response.status === 404) {
              setProfileLoaded(true)
            }
          }
        }
      )
  }

  useEffect(() => {
    getUser()
    document.title = t('Subscribers')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if(profileLoaded && !!profile) {
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
      return () => {
        (function() { dispatch(actions.clean()) })()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded])

  useEffect(() => {
    (async function() {
      if(previousUsernameFromParams !== undefined && usernameFromParams !== previousUsernameFromParams) {
        console.log('username changed')
        setProfile(null)
        setProfileLoaded(false)
        dispatch(actions.clean())
        getUser()
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromParams])

  if(profileLoaded && !profile) {
    return <ProfileNotFound />
  }

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
      <Paper style={{padding: 16}}>
        <Typography variant='body2' color='textSecondary' style={{marginBottom: 8}}>Реклама</Typography>
        <NavLink to='/kek' ><img style={{width: '100%'}} src='/images/rekl/333.jpg' /></NavLink>
      </Paper>
    </StickyPanel>
  </div>

  if(!!subscribers && !subscribers.length) {
    return <section className={classes.subscriptions}>
      <Paper className={classes.noSubscriptions} >
        <EmptyListStub
          imageSrc='/images/animals/hippopotamus.png'
          containerWidth={150}
          containerHeight={150}
        />

        <Typography variant='h6' >
          { isOwnSubscriptions
            ? t("You have no subscribers")
            : t("User has no subscribers")
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
    return <Paper key={skeleton} ><ConnectionSkeleton /></Paper>
  })

  return <section className={classes.subscriptions}>
    <main className={classes.subscriptionsList}>
      { !!profile && !!subscribers && subscribers.length > 0 &&
      <Paper style={{padding: 16}}>
        <Typography variant='subtitle2' >
          {isOwnSubscriptions
            ? `${t('My subscribers')} ${totalCount ? `(${totalCount})` : ''}`
            : `${t('Subscribers of')} ${profile.firstName} ${profile.lastName} ${totalCount ? `(${totalCount})` : ''}`
          }
        </Typography>
      </Paper>
      }
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
