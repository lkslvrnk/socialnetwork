import React, { useState, useEffect, lazy, useRef, useCallback } from 'react';
import Header from './components/Header/Header.js'
import NotFound from './components/NotFound/NotFound'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import 'moment/locale/fr'
import 'moment/locale/ru'
import 'moment/locale/uk'
import 'moment/locale/de'
import moment from 'moment'
import Button from '@material-ui/core/Button';
import { CssBaseline, Snackbar, IconButton, useMediaQuery, CircularProgress } from "@material-ui/core"
import {
  createTheme, responsiveFontSizes
} from '@material-ui/core/styles'
import { ThemeProvider } from "@material-ui/core/styles"
import getThemeObject from './theme.js'
import { useStyles } from './AppStyles.js'
import { initializeApp } from './redux/app_reducer'
import CloseIcon from '@material-ui/icons/Close'
import { AppStateType } from './redux/redux_store'
import PostPage from './components/PostPage/PostPage.js'
import LeftNavigation from './components/LeftNavigation/LeftNavigation.js'
import { useTranslation } from 'react-i18next'
import './App.css'
import Preloader from './components/Common/Preloader/Preloader.jsx'
import Feed from './components/Feed/Feed.js'
import Subscriptions from './components/Subscriptions/Subscriptions'
import Search from './components/Search/Search'
import { actions, getNewRequestsCount, logOut } from './redux/auth_reducer'
import { useTheme } from '@material-ui/core'
import Profile from './components/Profile/Profile'
import Connections from './components/Contacts/Connections'
import Login from './components/Login/Login'
import SignUp from './components/SignUp/SignUp'
import Settings from './components/Settings/Settings'
import Subscribers from './components/Subscribers/Subscribers'
import { instance, pusher } from './api/api'
import Initialization from './components/Common/Initialization.js'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { loadUnreadChats } from './redux/chats_reducer'
import Chats from './components/Chats/Chats'
import {actions as appActions} from './redux/app_reducer';
import Kek from './components/Kek.js';
import { debounce } from './helper/helperFunctions.js';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

const App: React.FC = React.memo(props => {
  const language = useSelector((state: AppStateType) => state.app.language)
  const appearance = useSelector((state: AppStateType) => state.app.appearance)
  const isInitialized = useSelector((state: AppStateType) => state.app.initialized)
  
  const classes = useStyles({ matches: true });
  const dispatch = useDispatch()
  
  const [networkLost, setNetworkLost] = useState(false);
  const [networkAppears, setNetworkAppears] = useState(false)
  const { t, i18n } = useTranslation()
  const history = useHistory()

  if (moment.locale() !== language) {
    moment.locale(language)
  }

  const upButton = useRef<HTMLDivElement>(null)

  const handleDocumentScroll = useCallback(debounce(() => {
    const docScrollTop = document.documentElement.scrollTop
    if(!upButton.current) {
      return
    }
    else if(docScrollTop > 400) {
      upButton.current.style.display = 'block'
    }
    else {
      upButton.current.style.display = 'none'
    }
  }, 20), [])

  useEffect(() => {
    if(isInitialized) {
      const onOffline = () => {
        dispatch(appActions.setIsOnline(false))
      }
      const onOnline = () => {
        dispatch(appActions.setIsOnline(true))
      }
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
      document.addEventListener('scroll', handleDocumentScroll)
    }
  }, [isInitialized])

  useEffect(() => {
    handleDocumentScroll()
    return () => console.log('app unmount')
  }, [])

  useEffect(() => {
    instance.interceptors.response.use(
      response => {
        return response
      },
      error => {
        if(error.response) {
          const status = error.response.status
          if(status === 401) {
            dispatch(logOut(history))
          }
          else if(status === 422) { // If a token is valid, but user is not found by id from token
            if(error.response.data.code === 32) {
              dispatch(logOut(history))
            }
          }
        }
        throw error
      }
    );

    dispatch(initializeApp())

    const handleInvalidToken = (e: any) => {
      if (e.key === 'JWT' && e.oldValue && !e.newValue) {
        dispatch(logOut(history))
      }
    }
    window.addEventListener('storage', handleInvalidToken)

    return () => {
      window.removeEventListener('storage', handleInvalidToken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let theObj: any = getThemeObject(Boolean(appearance))
  let themeConfig = responsiveFontSizes(createTheme(theObj))

  if(language !== i18n.language) {
    if(language) {
      i18n.changeLanguage(language)
    }
  }

  if(!isInitialized) {
    return <Initialization />
  }

  return (
    <ThemeProvider theme={themeConfig}>
      <Content />
      <div
        ref={upButton}
        className={classes.upButton}
      >
        <IconButton
          onClick={() => document.documentElement.scrollTo({
            top: 0,
            behavior: "smooth"
          })}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </div>
    </ThemeProvider>
  )
})

const Content = () => {
  const classes = useStyles({ matches: true });
  const maxWidth1200 = useMediaQuery('(max-width: 1200px)')
  const [dialogueInfo] = useState(false)
  const isAuthenticated = useSelector((state: AppStateType) => state.auth.isAuth)
  const theme = useTheme()
  const location = useLocation()
  // console.log(theme) 
  const currentUserId = useSelector((state: AppStateType) => state.auth.id)

  return (
    <SnackbarProvider
      classes={{ 
        root: classes.snack,
        // variantSuccess: classes.success,
        // variantError: classes.error,
        // variantWarning: classes.warning,
        // variantInfo: classes.info,
      }}
      maxSnack={5}
    >
      <CssBaseline />
      <Header dialogueInfo={dialogueInfo} />

      { maxWidth1200 && isAuthenticated && <LeftNavigation /> }

      <div className={classes.content}>
        { !maxWidth1200 && isAuthenticated && <LeftNavigation /> }
        <Chats />

        <React.Suspense fallback={<Preloader />}>

          <Switch >
            <Route exact path='/' render={() => <Feed /> } />
            <Route exact path='/i/:username/subscriptions' render={() => <Subscriptions /> } />
            <Route exact path='/i/:username/subscribers' render={() => <Subscribers /> } />
            <Route exact path='/search' render={() => <Search /> } />
            <Route exact path='/i/:username' render={() => <Profile />} />
            <Route exact path='/i/:username/contacts' render={() => <Connections />} />
            <Route path='/chats' render={() => <></>} />
            <Route path='/login' render={() => <Login />}  />
            <Route path='/signup' render={() => <SignUp />} />
            <Route path='/i/posts/:postId' render={() => <PostPage />} />
            <Route path='/settings' render={() => <Settings />}  />
            <Route path='/kek' render={() => <Kek />}  />
            
            <Route component={NotFound} />
          </Switch>
          {/* <Route exact path="/chats" children={({ match }) => <Chats1 match={match} />} /> */}

        </React.Suspense>

        {/* {networkLost && networkLostSnakbar}
        {networkAppears && networkAppearsSnackbar} */}
      </div>
    </SnackbarProvider>
  )
}

export default App
