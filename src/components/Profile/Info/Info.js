import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './InfoStyles';
import {
  List, ListItem, ListItemIcon, ListItemText, ListSubheader, Paper
} from '@material-ui/core';
import Typography from "@material-ui/core/Typography";
import moment from 'moment';
import Skeleton from '@material-ui/lab/Skeleton';
import WcIcon from '@material-ui/icons/Wc';
import CakeIcon from '@material-ui/icons/Cake';
import 'react-photo-view/dist/index.css';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import TypographyLink from '../../Common/TypographyLink.jsx';
import SubscriptionsIcon from '@material-ui/icons/Subscriptions';
import CustomAvatarGroup from '../../Common/CustomAvatarGroup';

const Info = React.memo(props => {

  const { profile } = props
  const classes = useStyles()
  const { t } = useTranslation()

  const birthday = !!profile && moment({
    day: profile.birthday.day,
    month: profile.birthday.month - 1,
    year: profile.birthday.year
  }).format("DD MMMM YYYY")

  const subscriptionsAvatars = []
  const length = profile 
    ? (profile.subscriptions.length > 5
      ? 5
      : profile.subscriptions.length)
    : 0
  for (let index = 0; index < length; index++) {
    const sub = profile.subscriptions[index]
    if (sub.picture) {
      subscriptionsAvatars.push({
        avatar: sub.picture.src,
        tooltip: null,
        backgroundColor: null,
        fontColor: null,
        style: null,
        fontSize: null
      })
    } else {
      subscriptionsAvatars.push(sub.firstName + ' ' + sub.lastName)
    }
  }

  const subscribersCount = !!profile ? Number(profile.subscribersCount) : null
  const subscriptionsCount = !!profile ? Number(profile.subscriptionsCount) : null

  const renderGenderInfo = (
    <ListItem >
      <ListItemIcon style={{ minWidth: 32 }} >
        {!!profile
          ? <WcIcon />
          : <Skeleton variant="circle" width={24} height={24} />
        }
      </ListItemIcon>

      <ListItemText
        primary={!!profile
          ? <Typography variant='body2' >
            {t(profile.gender[0].toUpperCase() + profile.gender.substring(1))}
          </Typography>
          : <Skeleton height={20} width={100} />
        }
      />
    </ListItem>
  )

  const renderBirthdayInfo = (
    <ListItem >
      <ListItemIcon style={{ minWidth: 32 }} >
        {!!profile
          ?
          <CakeIcon />
          :
          <Skeleton variant="circle" width={24} height={24} />
        }
      </ListItemIcon>

      <ListItemText
        primary={!!profile
          ?
          <Typography variant='body2' >
            {birthday}
          </Typography>
          :
          <Skeleton height={20} width={100} />
        }
      />
    </ListItem>
  )

  const renderSubscribersInfo = (
    <ListItem >
      <ListItemIcon style={{ minWidth: 32 }} >
        {!!profile
          ?
          <RssFeedIcon />
          :
          <Skeleton variant="circle" width={24} height={24} />
        }
      </ListItemIcon>

      {!!profile
        ?
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TypographyLink
            variant='body2'
            style={{ marginRight: 8 }}
            color='textPrimary'
            to={`/i/${profile.username}/subscribers`}
          >
            {`${t('Subscribers')}: ${subscribersCount}`}
          </TypographyLink>

          {subscribersCount > 0 &&
            <CustomAvatarGroup
              usersData={profile.subscribers.slice(0, 5)}
              width={28}
              total={subscribersCount}
            />
          }
        </div>
        :
        <Skeleton height={20} width={100} />
      }
    </ListItem>
  )

  const renderSubscriptionsInfo = (
    <ListItem >
      <ListItemIcon style={{ minWidth: 32 }} >
        {!!profile
          ?
          <SubscriptionsIcon />
          :
          <Skeleton variant="circle" width={24} height={24} />
        }
      </ListItemIcon>

      {!!profile
        ?
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TypographyLink
            variant='body2'
            style={{ marginRight: 8 }}
            color='textPrimary'
            to={`/i/${profile.username}/subscriptions`}
          >
            {`${t('Subscriptions')}: ${subscriptionsCount}`}
          </TypographyLink>

          {subscriptionsCount > 0 &&
            <CustomAvatarGroup
              usersData={profile.subscriptions.slice(0, 5)}
              width={28}
              total={subscriptionsCount}
            />
          }
        </div>
        :
        <Skeleton height={20} width={100} />
      }
    </ListItem>
  )

  return (
    <Paper component='section'>
      <List
        className={classes.mainInfoList}
        dense={true}
        subheader={<li />}
      >
        <ListSubheader disableSticky={true} >
          {t('Brief info')}
        </ListSubheader>
        {renderGenderInfo}
        {renderBirthdayInfo}
        {renderSubscribersInfo}
        {renderSubscriptionsInfo}
      </List>
    </Paper>
  )
})

export default Info