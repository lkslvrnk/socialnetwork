import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Drawer from './Drawer/Drawer.js'
import RightMenu from './RightMenu/RightMenu.js'
import { useTranslation } from 'react-i18next';
import { NavLink, useHistory, useLocation } from 'react-router-dom'
import { useStyles } from './HeaderStyles.js'
import { connect, useDispatch, useSelector } from 'react-redux'
import { compose } from 'redux'
import { withRouter } from 'react-router-dom'
import CustomToggleButton from '../Common/CustomToggleButton.js'
import {
  changeLanguage, changeAppearance, changeGuestLanguage
} from '../../redux/app_reducer'
import { getNewRequestsCount, logOut } from './../../redux/auth_reducer'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import withWidth from '@material-ui/core/withWidth';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Brightness4Icon from '@material-ui/icons/Brightness4';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import ListItemText from '@material-ui/core/ListItemText';
import {
  Badge, Box, Button, FormControl, Select, useMediaQuery
} from '@material-ui/core';
import Search from './Search/Search.js';
import TypographyLink from '../Common/TypographyLink.jsx';
import AcceptDialog from '../Common/AcceptDialog';
import { pusher } from '../../api/api';
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Slide from "@material-ui/core/Slide";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {
  getCurrentUserData, selectNewRequestsCount
} from '../../redux/auth_selectors';
import HomeIcon from '@material-ui/icons/Home';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import cn from 'classnames';
import PeopleIcon from '@material-ui/icons/People';
import { useSnackbar } from 'notistack';
import { Close } from '@material-ui/icons';

const Header = React.memo(({
  isAuth, width, language, changeLanguage, logOut,
  currentUserId, appearance, changeAppearance
}) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()
  const showRightMenu = useMediaQuery('(min-width:599px)')
  const newRequestsCount = useSelector(selectNewRequestsCount)
  const unreadChatsIds = useSelector(state => state.chats.unreadChatsIds)
  const userData = useSelector(getCurrentUserData)
  const firstName = userData.firstName || ""
  const lastName = userData.lastName || ""
  const username = userData.username || ""
  const path = username ? `/i/${username}` : '/i/unknown'
  const location = useLocation()
  let xs = width === 'xs'
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const splittedPathname = location.pathname.split('/')
  const chatIsOpen = splittedPathname[1] === 'chats' && splittedPathname[2] === 'c'

  const languages = [
    { name: 'English', short: 'en' },
    { name: 'Українська', short: 'uk' },
    { name: 'Русский', short: 'ru' }
  ]

  const [showDrawer, setShowDrawer] = React.useState(false);
  const [rightMenuAnchor, setRightMenuAnchor] = React.useState(null)

  const closeRightMenu = useCallback(() => {
    if (rightMenuAnchor) {
      setRightMenuAnchor(null)
    }
  }, [rightMenuAnchor])

  useEffect(() => {
    if (!showRightMenu) {
      closeRightMenu()
    }
  }, [showRightMenu, closeRightMenu])

  useEffect(() => {
    if (currentUserId) {
      let channel = pusher.subscribe(currentUserId)

      channel.bind('create-connection', function (data) {
        const initiator = data.initiator

        const actions = function (key) {
          const onButtonClick = () => {
            history.push(`/i/${username}/contacts?section=incoming`)
            closeSnackbar(key)
          }
          return (
            <div style={{ display: 'flex' }}>
              <Button
                onClick={onButtonClick}
                style={{ marginRight: 8 }}
                children={t('Watch')}
              />
              <IconButton
                size='small'
                onClick={() => { closeSnackbar(key) }}
                children={<Close />}
              />
            </div>
          )
        }
        const initiatorName = `${initiator.firstName} ${initiator.lastName}`
        const text = `${initiatorName} ${t('offers you connection')}`
        enqueueSnackbar(text, { action: actions, variant: 'info' })
        dispatch(getNewRequestsCount(currentUserId))
      })

      channel.bind('delete-connection', function (data) {
        dispatch(getNewRequestsCount(currentUserId))
      })

      return () => {
        channel.unbind('create-connection')
        channel.unbind('delete-connection')
      }
    }
  }, [currentUserId, username, dispatch, history, enqueueSnackbar, closeSnackbar, t])

  const handleAppearanceSwitch = () => {
    changeAppearance(currentUserId, !Boolean(appearance))
  }

  const appearanceSwitcherListItem = (
    <ListItem>
      <ListItemIcon>
        <Brightness4Icon />
      </ListItemIcon>

      <FormControlLabel
        style={{ height: 28 }}
        control={
          <Switch
            size="medium"
            checked={Boolean(appearance)}
            onClick={handleAppearanceSwitch}
          />
        }
      />
    </ListItem>
  )

  const toggleRightMenu = event => {
    if (rightMenuAnchor) {
      setRightMenuAnchor(null)
    } else {
      setRightMenuAnchor(event.currentTarget)
    }
  }

  const onSetLanguage = language => {
    closeRightMenu()
    changeLanguage(currentUserId, language)
  }

  const [showLogOutDialog, setShowLogOutDialog] = useState(false)
  const openLogOutDialog = () => setShowLogOutDialog(true)
  const closeLogOutDialog = () => setShowLogOutDialog(false)

  const onLogOutInDialog = () => {
    logOut(history)
    closeRightMenu()
    setShowDrawer(false)
    closeLogOutDialog()
  }

  const renderExitListItem = (
    <ListItem button onClick={openLogOutDialog}>
      <ListItemIcon><ExitToAppOutlinedIcon /></ListItemIcon>
      <ListItemText primary={t('Log out')} />
    </ListItem>
  )

  const [showUpButton, setShowUpButton] = useState(false)
  const upButton = useRef(null)
  const upButtonWrapper = useRef(null)

  const prevDirection = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const docScrollTop = document.documentElement.scrollTop
      if (!upButton.current || !upButtonWrapper.current) {
        return
      } else if (docScrollTop > 400) {
        setShowUpButton(true)
        prevDirection.current = 'down'
      } else {
        setShowUpButton(false)
        prevDirection.current = 'up'
      }
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const renderUserNavigation = (
    <Fragment>
      <div className={classes.drawerRoot}>
        <IconButton
          edge="start"
          onClick={() => setShowDrawer(true)}
        >
          <Badge
            variant="dot"
            color="secondary"
            invisible={newRequestsCount === 0 && unreadChatsIds.length === 0}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <MenuIcon />
          </Badge>
        </IconButton>

        <Drawer
          className={classes.drawer}
          appearanceSwitcher={appearanceSwitcherListItem}
          currentUserId={currentUserId}
          language={language}
          languages={languages}
          onSetLanguage={onSetLanguage}
          show={showDrawer}
          setShow={setShowDrawer}
          renderExitListItem={renderExitListItem}
        />
      </div>

      <div className={classes.leftSide}>
        <NavLink
          className={classes.logo}
          to='/'
          children={
            <img
              src='/images/logo5.png'
              width='46px'
              alt='logo'
            />
          }
        />
        <Search />
      </div>

      <div className={'grow'} />

      <div className={classes.medium}>
        <IconButton
          component={NavLink}
          to={{
            pathname: path,
            state: { firstName, lastName }
          }}
          className={classes.mediumButton}
          style={{ marginRight: 8 }}
          children={<HomeIcon />}
          title={t('My profile')}
        />

        <IconButton
          component={NavLink}
          to={'/chats'}
          className={classes.mediumButton}
          style={{ marginRight: 8 }}
          title={t('Chats')}
        >
          <Badge
            badgeContent={unreadChatsIds.length}
            color="secondary"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <QuestionAnswerIcon />
          </Badge>
        </IconButton>

        <IconButton
          component={NavLink}
          to={`${path}/contacts${newRequestsCount ? '?section=incoming' : ''}`}
          className={classes.mediumButton}
          title={t('Contacts')}
        >
          <Badge
            badgeContent={newRequestsCount}
            color="secondary"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <PeopleIcon />
          </Badge>
        </IconButton>
      </div>

      <div className={'grow'} />

      <div className={classes.rightSide}>
        <Box
          ref={upButtonWrapper}
          className={cn(
            classes.upButtonWrapper,
            showUpButton
              ? classes.upButtonWrapperVisible
              : classes.upButtonWrapperHidden
          )}
          overlap="circular"
        >
          <IconButton
            ref={upButton}
            className={cn(
              classes.upButton,
              showUpButton
                ? classes.upButtonVisible
                : classes.upButtonHidden
            )}
            size='medium'
            onClick={() => document.documentElement.scrollTo({
              top: 0,
              behavior: "smooth"
            })}
            style={{ width: 40, height: 40, }}
            title={t('Up')}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </Box>

        <CustomToggleButton
          selected={Boolean(rightMenuAnchor)}
          onChange={toggleRightMenu}
          size='small'
          className={classes.rightMenuButton}
        >
          <ArrowDropDownIcon fontSize="large" />
        </CustomToggleButton>
      </div>
    </Fragment>
  )

  const guestNavigation = (
    <Fragment>
      <TypographyLink to="/login">
        {t('Login')}
      </TypographyLink>

      <div style={{ width: '20px' }} />

      <TypographyLink to="/signup" >
        {t('Register')}
      </TypographyLink>

      <div className={classes.selectNotLoggedUserLanguage} >
        <FormControl>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={language}
            onChange={(event) => {
              dispatch(changeGuestLanguage(event.target.value))
            }}
          >
            {languages.map(item => (
              <MenuItem
                key={item.short}
                value={item.short}
              >
                {`${item.name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </Fragment>
  )

  const trigger = useScrollTrigger();

  if (chatIsOpen && xs) {
    return null
  }

  const appBar = (
    <AppBar className={classes.appBar} position="fixed" color="inherit" >
      <Toolbar style={{ minHeight: 48, maxHeight: 48 }} >
        {isAuth ? renderUserNavigation : guestNavigation}
      </Toolbar>
    </AppBar>
  )

  return (
    <>
      {xs
        ?
        <Slide appear={false} direction="down" in={!trigger}>
          {appBar}
        </Slide>
        :
        appBar
      }

      {showRightMenu &&
        <RightMenu
          anchor={rightMenuAnchor}
          languages={languages} onSetLanguage={onSetLanguage}
          appearanceSwitcher={appearanceSwitcherListItem}
          toggleRightMenu={toggleRightMenu}
          renderExitListItem={renderExitListItem}
        />
      }
      <AcceptDialog
        show={showLogOutDialog}
        setShow={setShowLogOutDialog}
        onYes={onLogOutInDialog}
        title={t('Exit from app')}
        text={t('You sure you want exit from app')}
      />
    </>
  );
})

let mapStateToProps = state => {
  return {
    currentUserId: state.auth.id,
    language: state.app.language,
    isAuth: state.auth.isAuth,
    appearance: state.app.appearance,
  }
}

export default compose(
  connect(mapStateToProps, { changeLanguage, changeAppearance, logOut }),
  withRouter,
  withWidth()
)(Header);
