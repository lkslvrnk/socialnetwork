import React from 'react'
import {NavLink} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import LanguageIcon from '@material-ui/icons/Language'
import { makeStyles } from '@material-ui/core/styles'
import ViewStreamIcon from '@material-ui/icons/ViewStream'
import SubscriptionsIcon from '@material-ui/icons/Subscriptions'
import HomeIcon from '@material-ui/icons/Home'
import PeopleIcon from '@material-ui/icons/People'
import { useSelector } from 'react-redux'
import { getCurrentUserUsername } from '../../../redux/auth_selectors';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import { Badge } from '@material-ui/core'
import ForumIcon from '@material-ui/icons/Forum';

const useStyles = makeStyles((theme) => ({
  formControl: {},
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  selectLanguage: {
    // color: 'red',
    '& .MuiSelect-select': {
      // color: 'blue',
      fontSize: theme.typography.body2.fontSize,
      // border: '3px solid white'
    }
  }
}));

const Drawer = React.memo((
  {appearanceSwitcher, renderExitListItem, show, setShow, language, languages, onSetLanguage, currentUserId}
) => {
  const currentUserUsername = useSelector(getCurrentUserUsername)
  const newRequestsCount = useSelector(state => state.auth.newRequestsCount)
  const { t } = useTranslation();
  const unreadChatsIds = useSelector(state => state.chats.unreadChatsIds)

  const classes = useStyles()
  // console.log(classes)
  const handleDrawerOpen = () => {
    setShow(true);
  };

  const handleDrawerClose = () => {
    setShow(false);
  };

  let navLinks = [
    { key: 1, to: '', name: t('Feed'), icon: DynamicFeedIcon, count: 0  },
    { key: 2, to: `i/${currentUserUsername}`, name: t('My profile'), icon: HomeIcon, count: 0  },
    { key: 3, to: `chats`, name: t('Chats'), icon: ForumIcon, count: unreadChatsIds.length },
    { key: 4, to: `i/${currentUserUsername}/contacts`, name: t('Contacts'), icon: PeopleIcon, count: newRequestsCount  },
    { key: 5, to: `i/${currentUserUsername}/subscriptions`, name: t('Subscriptions'), icon: SubscriptionsIcon, count: 0  },
    { key: 6, to: `i/${currentUserUsername}/subscribers`, name: t('Subscribers'), icon: RssFeedIcon, count: 0  },
  ]

  let linksList = navLinks.map(link => {
    let path
    if(link.to === 'profile') {
      path = `/profile/${currentUserId}`
    } else {
      path = `/${link.to}`
    }

    return (
      <React.Fragment key={link.key}>
        <ListItem
          button component={NavLink} to={path}
          onClick={handleDrawerClose}
        >
          { link.count ?
            <Badge
              badgeContent={link.count}
              color="secondary"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <ListItemIcon>{<link.icon />}</ListItemIcon>
            </Badge>
            :
            <ListItemIcon>{<link.icon />}</ListItemIcon>
          }
          <ListItemText primary={t(link.name)} />
        </ListItem>
        <Divider />
      </React.Fragment>
    )
  })

  let selectLanguage = (
    <ListItem key={1}>
      <ListItemIcon><LanguageIcon /></ListItemIcon>
      <FormControl className={classes.formControl} size='small' >

        <InputLabel id="demo-simple-select-label">{t('Language')}</InputLabel>
        <Select
          className={classes.selectLanguage}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={language}
          onChange={(event) => onSetLanguage(event.target.value)}
        >
        {languages.map(item => {
          return (
            <MenuItem key={item.short} dense value={item.short}>
              {item.name}
            </MenuItem>
        )})}
        </Select>
      </FormControl>
    </ListItem>
  )

  return (
    <SwipeableDrawer 
      anchor="left"
      open={show}
      onClose={handleDrawerClose}
      onOpen={handleDrawerOpen}
    >          
      <List dense style={{width: '200px'}}>
        {linksList}

        <div style={{height: '50px'}} />
        <Divider />
        {appearanceSwitcher}
        <Divider />
        {selectLanguage}
        <Divider />
        {renderExitListItem}
      </List>
    </SwipeableDrawer>
  )
})

export default Drawer

