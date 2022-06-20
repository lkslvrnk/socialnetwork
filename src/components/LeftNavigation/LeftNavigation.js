import React from 'react'
import { NavLink} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './LeftNavigationStyles.js'
import { Badge, Box, IconButton, Paper, useMediaQuery } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import { getCurrentUserData, getCurrentUserUsername } from '../../redux/auth_selectors';
import ViewStreamIcon from '@material-ui/icons/ViewStream';
import SubscriptionsIcon from '@material-ui/icons/Subscriptions';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import { AppStateType } from '../../redux/redux_store';
import ForumIcon from '@material-ui/icons/Forum';

const LeftNavigation = React.memo( props => {
  let classes = useStyles()
  const currentUserUsername = useSelector(getCurrentUserUsername)
  const currentUserData = useSelector(getCurrentUserData)
  const firstName = currentUserData.firstName || 'Unknown'
  const lastName = currentUserData.lastName || 'Unknown'
  const username = useSelector((state) => state.auth.username)
  const isAuthenticated = useSelector((state) => state.auth.isAuth)
  const { t } = useTranslation()
  const largeIcons = useMediaQuery('(max-width: 1000px)')
  const newRequestsCount = useSelector(state => state.auth.newRequestsCount)
  const unreadChatsIds = useSelector(state => state.chats.unreadChatsIds)

  // console.log(unreadChatsIds)

  let navLinks = [
    { key: 1, to: '', name: t('Feed'), icon: DynamicFeedIcon, count: 0, state: {} },
    { key: 2, to: `i/${currentUserUsername}`, name: t('My profile'), icon: HomeIcon, count: 0, state: {firstName, lastName} },
    { key: 3, to: `chats`, name: t('Chats'), icon: ForumIcon, count: unreadChatsIds.length, state: {} },
    { key: 4, to: `i/${currentUserUsername}/contacts`, name: t('Contacts'), icon: PeopleIcon, count: newRequestsCount, state: {} },
    { key: 5, to: `i/${currentUserUsername}/subscriptions`, name: t('Subscriptions'), icon: SubscriptionsIcon, count: 0, state: {} },
    { key: 6, to: `i/${currentUserUsername}/subscribers`, name: t('Subscribers'), icon: RssFeedIcon, count: 0, state: {} },
  ]

  let renderNavLinks = navLinks.map(link => {
    let path = link.to === 'profile' ? `/${username}` : `/${link.to}`

    return (
      <Box className={classes.leftNavItem} key={ link.key } overlap="circular">
        <Paper
          style={{ borderRadius: '30px' }}
        >
          <IconButton
            elevation={5}
            size={ largeIcons ? 'medium' : 'small'}
            className={classes.leftNavIcon}
            component={NavLink}
            to={{
              pathname: path,
              state: link.state
            }}
          >
            { link.count
              ? <Badge
                badgeContent={link.count}
                color="secondary"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <link.icon  />
              </Badge>
              :
              <link.icon  />
            }
          </IconButton>
          
        </Paper>

        <div className={classes.leftNavItemText} >
          <Typography 
            component={NavLink} to={path}
            variant='body2'
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {t(link.name)}
          </Typography>
        </div>
      </Box>
    )
  })

  return (
    <nav className={classes.leftNavContainer}>
      <div className={classes.leftNav} >
        { isAuthenticated && renderNavLinks }
      </div>
    </nav>
  )

})

export default LeftNavigation
