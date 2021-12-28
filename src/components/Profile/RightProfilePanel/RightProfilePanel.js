import React from 'react';
import './RightProfilePanel.css'
import Paper from "@material-ui/core/Paper";
import WcIcon from '@material-ui/icons/Wc';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CakeIcon from '@material-ui/icons/Cake';
import Typography from "@material-ui/core/Typography";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { withStyles } from "@material-ui/core/styles";
import StyledSkeleton from '../../StyledSkeleton/StyledSkeleton.js';
import {useTranslation} from 'react-i18next';
import moment from 'moment'
import Avatar from '@mui/material/Avatar';
import { ImageList, ImageListItem, Stack } from '@mui/material';
import { NavLink } from 'react-router-dom';
import './Styles.css';
import { useStyles } from './RightProfilePanelStyles.js';

const RightProfilePanel = ({matchParams, profile, isLoading, onPhotoClick, pictures}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const iconSkeleton = <StyledSkeleton variant="circle" width={24} height={24} />
  const textSkeleton = <StyledSkeleton height={20} /> 

  const birthday = isLoading ? null : moment(profile.birthday).format("DD MMMM YYYY")

  let mainInfo = [
    {icon: <LocationOnIcon />, text: isLoading ? textSkeleton : profile.city + ', ' + profile.country}, 
    {icon: <WcIcon />, text: profile && profile.gender},
    {icon: <CakeIcon />, text: birthday}, 
  ]

  const preparedPhotos = []
  for(let i = 0; i < 3; i++) {
    if(pictures[i]) {
      preparedPhotos.push(pictures[i])
    }
  }

  const infoSection = (
    <Paper className={classes.section} >
      <List
        className={classes.mainInfoList}
        dense={true}
        subheader={<li />}
      >
        <ListSubheader 
          disableSticky={true}
          id="nested-list-subheader"
        > {t('Brief info')} </ListSubheader>

        {mainInfo.map(item => {
          return (
            <ListItem key={item.text}>
              <SmallListItemIcon >
                {isLoading ? iconSkeleton : item.icon}
              </SmallListItemIcon>

              <ListItemText
                //id="switch-list-label-wifi"
                primary={ isLoading
                  ? textSkeleton
                  : <Typography variant='body2' >{item.text}</Typography>
                }
              />
            </ListItem>
          )})}
      </List>
    </Paper>
  )

  const photosSection = preparedPhotos.length > 0 &&
    <Paper
      id='photos-section'
      className={classes.section}
    >
      <List
        subheader={<li />}
        style={{paddingBottom: 15}}
      >
        <ListSubheader 
          disableSticky={true}
        >
          {t('Photos')}
        </ListSubheader>
          <div style={{padding: `0 8px`, display: 'flex', justifyContent: 'space-between',}}>
            {preparedPhotos.map((photo, index) => (
              <div
                onClick={() => onPhotoClick(index)}
                style={{
                  cursor: 'pointer',
                  width: 90, height: 90,
                  backgroundImage: `url(${photo.src})`,
                  backgroundSize: 'cover',
                }}
              />
            ))}
          </div>
      </List>
    </Paper>

  return (
    <div
      className={classes.panel}
    >
      { infoSection }
      { photosSection }

      <footer
        style={{
          padding: '0 8px 8px 8px',
          textAlign: 'center'
        }}
      >
        Privacy  · Terms  · Advertising  · Ad Choices   · Cookies  ·   · OTVAL © 2021
      </footer>

    </div>
  )
}

const SmallListItemIcon = withStyles(theme => ({
  root: {
    minWidth: theme.spacing(5)
  }
}))(ListItemIcon)

export default RightProfilePanel
