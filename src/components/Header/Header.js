import React, {Fragment, useState} from 'react';
import Drawer from './Drawer/Drawer.js'
import RightMenu from './RightMenu/RightMenu.js'
import { useTranslation } from 'react-i18next';
import {NavLink, useHistory} from 'react-router-dom'
import { useStyles } from './HeaderStyles.js'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withRouter} from 'react-router-dom'
import CustomToggleButton from '../CustomToggleButton.js'
import {changeLanguage, changeAppearance} from '../../redux/app_reducer'
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
import YesCancelDialog from '../Common/YesCancelDialog.js';
import { FormControl, Select } from '@material-ui/core';
import Search from './Search.js';

const Header = React.memo(({
  isAuth, width, language, changeLanguage, logOut,
  dialogueInfo, currentUserId, appearance, changeAppearance
}) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const history = useHistory()

  const languages = [
    {name: 'English', short: 'en'},
    {name: 'Русский', short: 'ru'},
    {name: 'Українська', short: 'uk'}
  ]

  const [showDrawer, setShowDrawer] = React.useState(false);

  const appearanceSwitcherListItem = (
    <ListItem>
      <ListItemIcon>
        <Brightness4Icon />
      </ListItemIcon>
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(appearance)} 
            onClick={() => changeAppearance(currentUserId, !Boolean(appearance))}
          />
        }
      />
    </ListItem>
  )

  const [rightMenuAnchor, setRightMenuAnchor] = React.useState(null)

  const closeRightMenu = () => {
    if(rightMenuAnchor) setRightMenuAnchor(null)
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
  
  const onLogOutClick1 = () => {
    openLogOutDialog()
  }
  
  const openLogOutDialog = () => {
    setShowLogOutDialog(true)
  }
  
  const closeLogOutDialog = () => {
    setShowLogOutDialog(false)
  }
  
  const onLogOutClick2 = () => {
    logOut(history)
    closeRightMenu()
    setShowDrawer(false)
    closeLogOutDialog()
  }
  
  const renderExitListItem = (
    <ListItem button onClick={onLogOutClick1}>
      <ListItemIcon><ExitToAppOutlinedIcon /></ListItemIcon>
      <ListItemText primary={t('Log out')}/>
    </ListItem>
  )

  let isMobile = width === 'xs' || width === 'sm'

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
        style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/d/d1/ShareX_Logo.png)', }}
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

  const notLoggedUserLanguage = (localStorage.language && localStorage.language.substring(0, 2)) || navigator.language.substring(0, 2)
  
  const guestNavigation = (
    <Fragment>
      <Link color="inherit" component={NavLink} to="/login">{t('Login')}</Link>
      <div style={{width: '20px'}}></div>
      <Link color="inherit" component={NavLink} to="/signup">{t('Register')}</Link>

      <div className={classes.selectNotLoggedUserLanguage} >
        <FormControl>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={ notLoggedUserLanguage }
            onChange={(event) => {
              localStorage.setItem('language', event.target.value)
              window.location.reload()
            }}
          >
          {languages.map(item => <MenuItem key={item.short} value={item.short}>{`${item.name}`}</MenuItem>)}
          </Select>
        </FormControl>
      </div>
    </Fragment>
  )

  return (
    <Grid item container>
     
      <AppBar position="fixed" color="inherit" >
        <Toolbar style={{minHeight: 48, maxHeight: 48}} >
          {isAuth ? renderUserNavigation : guestNavigation}
        </Toolbar>
      </AppBar>
      
      {width !== 'xs' && width !== 'sm' &&
        <RightMenu
          anchor={rightMenuAnchor}
          languages={languages} onSetLanguage={onSetLanguage}
          appearanceSwitcher={appearanceSwitcherListItem}
          toggleRightMenu={toggleRightMenu}
          renderExitListItem={renderExitListItem}
        />
      }
      <YesCancelDialog
        show={showLogOutDialog}
        setShow={setShowLogOutDialog}
        onYes={onLogOutClick2}
        title={t('Exit from app')}
        text={t('You sure you want exit from app')}
      />
    </Grid>
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
