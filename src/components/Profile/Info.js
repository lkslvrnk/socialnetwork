import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './ProfileStyles';
import {
  Avatar, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Paper
} from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from "@material-ui/core/Typography";
import moment from 'moment';
import { NavLink, useParams } from 'react-router-dom';
import { AvatarGroup } from '@material-ui/lab';
import Skeleton from '@material-ui/lab/Skeleton';
import { imagesStorage } from '../../api/api';
import WcIcon from '@material-ui/icons/Wc';
import CakeIcon from '@material-ui/icons/Cake';
import 'react-photo-view/dist/index.css';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import TypographyLink from '../Common/TypographyLink.jsx';
import SubscriptionsIcon from '@material-ui/icons/Subscriptions';

const Info = React.memo(props => {

  const { profile} = props
  
  const mobile = useMediaQuery('(max-width: 860px)')
  const classes = useStyles()
  const { t } = useTranslation()

  const birthday = !!profile && moment({
    day: profile.birthday.day,
    month: profile.birthday.month -1, 
    year: profile.birthday.year
  }).format("DD MMMM YYYY")

  console.log(birthday)
  return (
    <Paper
      component='section'
    >
      <List
        className={classes.mainInfoList}
        dense={true}
        subheader={<li />}
      >
        <ListSubheader disableSticky={true} >
          {t('Brief info')}
        </ListSubheader>
          <ListItem >
            <ListItemIcon style={{ minWidth: 32}} >
              {!!profile ? <WcIcon /> : <Skeleton variant="circle" width={24} height={24} /> }
            </ListItemIcon>

            <ListItemText
              primary={ !!profile
                ? <Typography variant='body2' >
                  {t(profile.gender[0].toUpperCase() + profile.gender.substring(1))}
                </Typography>
                : <Skeleton height={20} width={100} /> 
              }
            />
          </ListItem>

          <ListItem >
            <ListItemIcon style={{ minWidth: 32}} >
              {!!profile ? <CakeIcon /> : <Skeleton variant="circle" width={24} height={24} /> }
            </ListItemIcon>

            <ListItemText
              primary={ !!profile
                ? <Typography variant='body2' >
                  {birthday}
                </Typography>
                : <Skeleton height={20} width={100} /> 
              }
            />
          </ListItem>

          <ListItem >
            <ListItemIcon style={{ minWidth: 32}} >
              {!!profile ? <RssFeedIcon /> : <Skeleton variant="circle" width={24} height={24} /> }
            </ListItemIcon>

            { !!profile
              ? <div style={{display: 'flex', alignItems: 'center'}}>
                  <TypographyLink
                    variant='body2'
                    style={{marginRight: 8}}
                    color='textPrimary'
                    to={`/i/${profile.username}/subscribers`}
                  >
                    {`${t('Subscribers')}: ${profile.subscribersCount}`}
                  </TypographyLink>

                  { mobile && profile.subscribersCount > 0 &&
                    <AvatarGroup max={6}>
                      { profile.subscribers.map(sub => {

                        let link = `/i/${sub.username}`
                        let picture = `${imagesStorage}${sub.picture}`

                        return <Avatar
                          component={NavLink}
                          to={link}
                          style={{width: 28, height: 28}}
                          src={picture}
                        />
                      })}
                    </AvatarGroup>
                  }
                </div>
              : <Skeleton height={20} width={100} /> 
            }
          </ListItem>

          <ListItem >
            <ListItemIcon style={{ minWidth: 32}} >
              {!!profile ? <SubscriptionsIcon /> : <Skeleton variant="circle" width={24} height={24} /> }
            </ListItemIcon>

            { !!profile
              ? <div style={{display: 'flex', alignItems: 'center'}}>
                  <TypographyLink
                    variant='body2'
                    style={{marginRight: 8}}
                    color='textPrimary'
                    to={`/i/${profile.username}/subscriptions`}
                  >
                    {`${t('Subscriptions')}: ${profile.subscriptionsCount}`}
                  </TypographyLink>

                  {mobile && profile.subscriptionsCount > 0 &&
                    <AvatarGroup max={6}>
                      { profile.subscriptions.map(sub => {

                        let link = `/i/${sub.username}`
                        let picture = `${imagesStorage}${sub.picture}`

                        return <Avatar
                          component={NavLink}
                          to={link}
                          style={{width: 28, height: 28}}
                          src={picture}
                        />
                      })}
                    </AvatarGroup>
                  }
                </div>
              : <Skeleton height={20} width={100} /> 
            }
          </ListItem>
      </List>
    </Paper>
  )
})

export default Info