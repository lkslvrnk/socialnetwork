import React, { useState, useEffect, lazy } from 'react';
import Header from './components/Header/Header.js'
import NotFound from './components/NotFound/NotFound'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route, useHistory } from "react-router-dom";
import 'moment/locale/fr'
import 'moment/locale/ru'
import 'moment/locale/uk'
import 'moment/locale/de'
import moment from 'moment'
import Button from '@material-ui/core/Button';
import { CssBaseline, Snackbar, IconButton, useMediaQuery } from "@material-ui/core";
import {
  createMuiTheme, responsiveFontSizes
} from '@material-ui/core/styles';
import { ThemeProvider } from "@material-ui/core/styles";
import getThemeObject from './theme.js'
import { useStyles } from './AppStyles.js'
import { initializeApp } from './redux/app_reducer'
import CloseIcon from '@material-ui/icons/Close'
import { AppStateType } from './redux/redux_store';
import PostPage from './PostPage.js';
import LeftNavigation from './components/LeftNavigation/LeftNavigation.js';
import { useTranslation } from 'react-i18next';
import './App.css'
import Preloader from './components/Common/Preloader/Preloader.jsx'
import Feed from './components/Feed/Feed.js'
import Subscriptions from './components/Subscriptions/Subscriptions'
import Search from './components/Search/Search'
import { logOut } from './redux/auth_reducer'
import { useTheme } from '@material-ui/core'
import Profile from './components/Profile/Profile'
import Connections from './components/Contacts/Connections'
import Login from './components/Login/Login'
import SignUp from './components/SignUp/SignUp'
import Settings from './components/Settings/Settings'
import Subscribers from './components/Subscribers/Subscribers'
import { instance } from './api/api';

const App: React.FC = React.memo(props => {
  const language = useSelector((state: AppStateType) => state.app.language)
  const appearance = useSelector((state: AppStateType) => state.app.appearance)
  const isInitialized = useSelector((state: AppStateType) => state.app.initialized)
  const isAuthenticated = useSelector((state: AppStateType) => state.auth.isAuth)
  const classes = useStyles({ matches: true });
  const dispatch = useDispatch()
  const [dialogueInfo] = useState(false)
  const [networkLost, setNetworkLost] = useState(false);
  const [networkAppears, setNetworkAppears] = useState(false)
  const { t, i18n } = useTranslation()
  const history = useHistory()
  const theme = useTheme()

  const maxWidth1200 = useMediaQuery('(max-width: 1200px)')

  if (moment.locale() !== language) moment.locale(language)

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
          else if(status === 422) { // Если токен валидный, но пользователь по ID из токена не найден
            if(error.response.data.code === 32) {
              dispatch(logOut(history))
            }
          }
        }
        throw error
      }
    );

    function onoffline() {
      setNetworkLost(true)
    }
    function ononline() {
      setNetworkLost(false)
      setNetworkAppears(true)
    }
    window.addEventListener('offline', onoffline)
    window.addEventListener('online', ononline)

    const handleInvalidToken = (e: any) => {
      if (e.key === 'JWT' && e.oldValue && !e.newValue) {
        dispatch(logOut(history))
      }
    }
    window.addEventListener('storage', handleInvalidToken)

    dispatch(initializeApp())

    return () => {
      window.removeEventListener('offline', onoffline)
      window.removeEventListener('online', ononline)
      window.removeEventListener('storage', handleInvalidToken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let theObj: any = getThemeObject(Boolean(appearance))
  let themeConfig = responsiveFontSizes(createMuiTheme(theObj))
  let loadingDisplay = <div style={{ background: '#424242', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />

  if(!isInitialized) return loadingDisplay

  if(language !== i18n.language) {
    if(language) {
      i18n.changeLanguage(language)
    }
  }

  let networkLostSnakbar = <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    autoHideDuration={null}
    open={networkLost}
    message={t('Интернета нет')}
    action={
      <React.Fragment>
        <Button color="secondary" size="small" onClick={() => {}}>
          Refresh
        </Button>
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => setNetworkLost(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    }
  />

  let networkAppearsSnackbar = <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    open={networkAppears}
    message={t('Интернет есть!')}
    autoHideDuration={5000}
    action={
      <React.Fragment>
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => setNetworkAppears(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    }
  />

  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />
      <Header dialogueInfo={dialogueInfo} />
      
      <div className={classes.appBody} >
          { maxWidth1200 && isAuthenticated && <LeftNavigation /> }

        <div className={classes.content}>
          { !maxWidth1200 && isAuthenticated && <LeftNavigation /> }

          <React.Suspense fallback={<Preloader />}>

            <Switch >
              <Route exact path='/' render={() => <Feed /> } />
              <Route exact path='/i/:username/subscriptions' render={() => <Subscriptions /> } />
              <Route exact path='/i/:username/subscribers' render={() => <Subscribers /> } />
              <Route exact path='/search' render={() => <Search /> } />
              <Route exact path='/i/:username' render={() => <Profile />} />
              <Route exact path='/i/:username/contacts' render={() => <Connections />} />
              <Route path='/login' render={() => <Login />}  />
              <Route path='/signup' render={() => <SignUp />} />
              <Route path='/i/posts/:postId' render={() => <PostPage />} />
              <Route path='/settings' render={() => <Settings />}  />
              
              <Route component={NotFound} />
            </Switch>

          </React.Suspense>

          {networkLost && networkLostSnakbar}
          {networkAppears && networkAppearsSnackbar}
        </div>

      </div>

    </ThemeProvider>
  )
})

export default App
