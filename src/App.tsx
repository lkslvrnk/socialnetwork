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
import { CssBaseline, Snackbar, IconButton } from "@material-ui/core";
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
import Preloader from './components/Common/Preloader/Preloader.jsx';
import Feed from './components/Feed/Feed.js';
import Subscriptions from './components/Subscriptions/Subscriptions';
import Search from './components/Search/Search';
import { logOut } from './redux/auth_reducer';

const Connections = lazy(() => import('./components/Contacts/Connections'))
const Profile = lazy(() => import('./components/Profile/Profile.js'))
const Login = lazy(() => import('./components/Login/Login.js'))
const SignUp = lazy(() => import('./components/SignUp/SignUp.js'))
const Settings = lazy(() => import('./components/Settings/Settings.js'))

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
  const { i18n } = useTranslation()
  const history = useHistory()

  if (moment.locale() !== language) moment.locale(language)

  useEffect(() => {
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

  if (!isInitialized) return loadingDisplay

  if (language !== i18n.language) {
    if (language) setTimeout(() => i18n.changeLanguage(language), 100)
    return loadingDisplay
  }

  let networkLostSnakbar = <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    autoHideDuration={null}
    open={networkLost}
    message={'Интернета нема'}
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
    message={'Интернет есть!'}
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
      { isAuthenticated && <LeftNavigation /> }
        <div className={classes.content}>

          <React.Suspense fallback={<Preloader />}>

            <Switch >
              <Route exact path='/' render={() => <Feed /> } />
              <Route exact path='/i/:username/subscriptions' render={() => <Subscriptions /> } />
              <Route exact path='/search' render={() => <Search /> } />
              <Route exact path='/i/:username' component={Profile} />
              <Route exact path='/i/:username/contacts' component={Connections} />
              <Route path='/login' component={Login} />
              <Route path='/signup' component={SignUp} />
              <Route path='/i/posts/:postId' render={() => <PostPage />} />
              <Route path='/settings' component={Settings} />
              
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
