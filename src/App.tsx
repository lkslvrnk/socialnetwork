import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header/Header.js'
import NotFound from './components/NotFound/NotFound'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route, useHistory } from "react-router-dom";
import 'moment/locale/fr'
import 'moment/locale/ru'
import 'moment/locale/uk'
import 'moment/locale/de'
import moment from 'moment'
import { CssBaseline } from "@material-ui/core"
import {
  createTheme, responsiveFontSizes
} from '@material-ui/core/styles'
import { ThemeProvider } from "@material-ui/core/styles"
import getThemeObject from './theme.js'
import { useStyles } from './AppStyles.js'
import { initializeApp } from './redux/app_reducer'
import { AppStateType } from './redux/redux_store'
import { useTranslation } from 'react-i18next'
import Preloader from './components/Common/Preloader/Preloader.jsx'
import Feed from './components/Feed/Feed.js'
import Subscriptions from './components/Subscriptions/Subscriptions'
import { logOut } from './redux/auth_reducer'
import Profile from './components/Profile/Profile'
import Connections from './components/Contacts/Connections'
import Login from './components/Login/Login'
import SignUp from './components/SignUp/SignUp'
import Settings from './components/Settings/Settings'
import Subscribers from './components/Subscribers/Subscribers'
import { instance } from './api/api'
import Initialization from './components/Initialization/Initialization.js'
import { SnackbarProvider } from 'notistack'
import Chats from './components/Chats/Chats'
import {actions as appActions} from './redux/app_reducer';
import Kek from './components/Kek.js';
import { debounce } from './helper/helperFunctions.js';
import Search from './components/Search/Search';
import PostPage from './components/PostPage/PostPage.jsx';

const App: React.FC = React.memo(props => {
  const language = useSelector((state: AppStateType) => state.app.language)
  const appearance = useSelector((state: AppStateType) => state.app.appearance)
  const isInitialized = useSelector((state: AppStateType) => state.app.initialized)
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const history = useHistory()

  if (moment.locale() !== language) {
    moment.locale(language)
  }

  const upButton = useRef<HTMLDivElement>(null)

  const handleDocumentScroll = useCallback(debounce(() => {
    const docScrollTop = document.documentElement.scrollTop
    if(!upButton.current) {
      return
    } else if(docScrollTop > 400) {
      upButton.current.style.display = 'block'
    } else {
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
  }, [isInitialized, dispatch, handleDocumentScroll])

  useEffect(() => {
    handleDocumentScroll()
    return () => console.log('app unmount')
  }, [handleDocumentScroll])

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
          else if(status === 422) {
            // If a token is valid, but user is not found by id from token
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
    </ThemeProvider>
  )
})

const Content = () => {
  const classes = useStyles({ matches: true });
  const [dialogueInfo] = useState(false)

  return (
    <SnackbarProvider
      maxSnack={5}
    >
      <CssBaseline />
      <Header dialogueInfo={dialogueInfo} />

      {/* { maxWidth1200 && isAuthenticated && <LeftNavigation /> } */}

      <div id='app-body' className={classes.appBody}>
        {/* { !maxWidth1200 && isAuthenticated && <LeftNavigation /> } */}
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
            {/* <Route path='/signup' render={() => <SignUp />} /> */}
            <Route path='/i/posts/:postId' render={() => <PostPage />} />
            {/* <Route path='/settings' render={() => <Settings />}  />
            <Route path='/kek' render={() => <Kek />}  /> */}
            
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
