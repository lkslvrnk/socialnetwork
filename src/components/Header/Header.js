import React, {Fragment, useEffect, useState} from 'react';
import Drawer from './Drawer/Drawer.js'
import RightMenu from './RightMenu/RightMenu.js'
import { useTranslation } from 'react-i18next';
import {NavLink, useHistory} from 'react-router-dom'
import { useStyles } from './HeaderStyles.js'
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {withRouter} from 'react-router-dom'
import CustomToggleButton from '../Common/CustomToggleButton.js'
import {changeLanguage, changeAppearance, changeGuestLanguage} from '../../redux/app_reducer'
import {logOut} from './../../redux/auth_reducer'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
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
import Link from '@material-ui/core/Link';
import HorizontalGrow from '../Common/HorizontalGrow.jsx';
import { FormControl, Select, useMediaQuery } from '@material-ui/core';
import Search from './Search.js';
import TypographyLink from '../Common/TypographyLink.jsx';
import AcceptDialog from '../Common/AcceptDialog.js';

const Header = React.memo(({
  isAuth, width, language, changeLanguage, logOut,
  dialogueInfo, currentUserId, appearance, changeAppearance
}) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()
  const showRightMenu = useMediaQuery('(min-width:860px)')

  const languages = [
    {name: 'English', short: 'en'},
    {name: 'Русский', short: 'ru'},
    {name: 'Українська', short: 'uk'}
  ]

  const [showDrawer, setShowDrawer] = React.useState(false);

  useEffect(() => {
    if(!showRightMenu) {
      closeRightMenu()
    }
  }, [showRightMenu])

  const handleAppearanceSwitch = () => {
    changeAppearance(currentUserId, !Boolean(appearance))
  }

  const appearanceSwitcherListItem = (
    <ListItem>
      <ListItemIcon>
        <Brightness4Icon />
      </ListItemIcon>
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(appearance)} 
            onClick={handleAppearanceSwitch}
          />
        }
      />
    </ListItem>
  )

  const [rightMenuAnchor, setRightMenuAnchor] = React.useState(null)

  const closeRightMenu = () => {
    if(rightMenuAnchor) {
      setRightMenuAnchor(null)
    }
  }

  const toggleRightMenu = event => {
    if(rightMenuAnchor) {
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

  const openLogOutDialog = () => {
    setShowLogOutDialog(true)
  }
  
  const closeLogOutDialog = () => {
    setShowLogOutDialog(false)
  }
  
  const onLogOutInDialog = () => {
    logOut(history)
    closeRightMenu()
    setShowDrawer(false)
    closeLogOutDialog()
  }
  
  const renderExitListItem = (
    <ListItem button onClick={openLogOutDialog}>
      <ListItemIcon><ExitToAppOutlinedIcon /></ListItemIcon>
      <ListItemText primary={t('Log out')}/>
    </ListItem>
  )

  let isMobile = width === 'xs' || width === 'sm'

  const logo = 'url(https://upload.wikimedia.org/wikipedia/commons/d/d1/ShareX_Logo.png)'

  const renderUserNavigation = (
    <Fragment>
      <div className={ classes.drawerRoot }>
        <IconButton
          edge="start"
          className={classes.openDrawerButton}
          onClick={() => setShowDrawer(true)}
        >
          <MenuIcon />
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
      
      <NavLink
        className={ classes.logo}
        to='/'
        style={{ backgroundImage: logo }}
      />

      {dialogueInfo.isOpen && isMobile ?
        <>             
          {dialogueInfo.component}
          <HorizontalGrow/>
          <Link
            color="inherit"
            component={NavLink} to={`/dialogs`} 
            style={{marginLeft: 8, marginRight: 8}}
          >
            {t('To dialogues')}
          </Link>
        </>
        :
        <>
          <Search />
          <div className={classes.grow} ></div>
          <HorizontalGrow/>
        </>
      }
      
      <CustomToggleButton
        selected={Boolean(rightMenuAnchor)}
        onChange={toggleRightMenu}
        size='small'
        className={classes.rightMenuButton}
      >
        <ArrowDropDownIcon fontSize="large" />
      </CustomToggleButton>
    </Fragment>
  )
  
  const guestNavigation = (
    <Fragment>
      <TypographyLink to="/login">
        {t('Login')}
      </TypographyLink>
      <div style={{width: '20px'}}/>
      <TypographyLink to="/signup" >
        {t('Register')}
      </TypographyLink>

      <div className={classes.selectNotLoggedUserLanguage} >
        <FormControl>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={ language }
            onChange={(event) => {
              dispatch(changeGuestLanguage(event.target.value))
            }}
          >
          {languages.map(item => {
            return <MenuItem
              key={item.short}
              value={item.short}
            >
              {`${item.name}`}
            </MenuItem>
          })}
          </Select>
        </FormControl>
      </div>
    </Fragment>
  )

  return (
    <>
      <AppBar position="fixed" color="inherit" >
        <Toolbar style={{minHeight: 48, maxHeight: 48, }} >
          {isAuth ? renderUserNavigation : guestNavigation}
        </Toolbar>
      </AppBar>
      
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
  connect(mapStateToProps, {changeLanguage, changeAppearance, logOut}),
  withRouter,
  withWidth()
)(Header);
