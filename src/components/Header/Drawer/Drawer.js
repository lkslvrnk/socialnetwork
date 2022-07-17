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
import HomeIcon from '@material-ui/icons/Home'
import { useSelector } from 'react-redux'
import { getCurrentUserUsername } from '../../../redux/auth_selectors';
import { Badge } from '@material-ui/core'
import ForumIcon from '@material-ui/icons/Forum';
import PeopleIcon from '@material-ui/icons/People';
import { useStyles } from './DrawerStyles'

const Drawer = React.memo((
  {appearanceSwitcher, renderExitListItem, show, setShow, language, languages, onSetLanguage, currentUserId}
) => {
  const currentUserUsername = useSelector(getCurrentUserUsername)
  const { t } = useTranslation();
  const unreadChatsIds = useSelector(state => state.chats.unreadChatsIds)
  const newRequestsCount = useSelector(state => state.auth.newRequestsCount)
  const classes = useStyles()

  const handleDrawerOpen = () => setShow(true)
  const handleDrawerClose = () => setShow(false);

  let navLinks = [
    // { key: 1, to: '', name: t('Feed'), icon: DynamicFeedIcon, count: 0  },
    { key: 2, to: `i/${currentUserUsername}`, name: t('My profile'), icon: HomeIcon, count: 0  },
    { key: 3, to: `chats`, name: t('Chats'), icon: ForumIcon, count: unreadChatsIds.length },
    { key: 4, to: `i/${currentUserUsername}/contacts`, name: t('Contacts'), icon: PeopleIcon, count: newRequestsCount  },
    // { key: 5, to: `i/${currentUserUsername}/subscriptions`, name: t('Subscriptions'), icon: SubscriptionsIcon, count: 0  },
    // { key: 6, to: `i/${currentUserUsername}/subscribers`, name: t('Subscribers'), icon: RssFeedIcon, count: 0  },
  ]

  let linksList = navLinks.map(link => {
    let path = link.to === 'profile'
      ? `/profile/${currentUserId}` : `/${link.to}`

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
      <List dense className={classes.items} >
        {linksList}

        <div style={{height: '20px'}} />
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

