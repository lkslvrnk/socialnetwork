import React, {useState, useEffect} from 'react';
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
import classNames from 'classnames';
import { useStyles } from './RightProfilePanelStyles.js';import { useDispatch } from 'react-redux';
import ProfileAvatar from '../ProfileAvatar/ProfileAvatar';

const RightProfilePanel = ({matchParams, profile, isLoading, isOwnProfile, currentUserId}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  
  const showTitle = 'Показать подробную инфу';
  let [showDetailed, changeShowDetailed] = useState(false);
  let [title, changeTitle] = useState(showTitle);

  useEffect(() => discard(),[matchParams])

  const discard = () => {
    changeTitle(showTitle);
    changeShowDetailed(false);
  }

  const iconSkeleton = <StyledSkeleton variant="circle" width={24} height={24} />
  const textSkeleton = <StyledSkeleton height={20} /> 

  const birthday = isLoading ? null : moment(profile.birthday).format("DD MMMM YYYY")

  let mainInfo = [
    {icon: <LocationOnIcon />, text: isLoading ? textSkeleton : profile.city + ', ' + profile.country}, 
    {icon: <WcIcon />, text: profile && profile.gender},
    {icon: <CakeIcon />, text: birthday}, 
  ]

  let photos = [
    {src: "https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/26/5c/c9/265cc9b2-2dc6-2499-9728-f1fd5c837184/source/256x256bb.jpg"},
    {src: "https://is1-ssl.mzstatic.com/image/thumb/Purple71/v4/c8/36/9f/c8369fa9-9dbb-fbb3-1ffc-542d95e019e9/source/256x256bb.jpg"},
    {src: "https://static-s.aa-cdn.net/img/gp/20600002404286/pRD2XG5X2KqiDoA4L1eNJFlN4_7ghS8cPiMux_wWEDVKzASYPJSsSMQ6580qan62ydRV=w300?v=1"}
  ]

  const avatarAndNameSection = (
    <Paper className={classNames(classes.section, classes.avatarAndName)}>
      <div className={classes.avatar} >
        {/*<ProfilePicture/>*/}
        <ProfileAvatar isOwnProfile={isOwnProfile} currentUserId={currentUserId} />
      </div>
      <div className={classes.name} >
        <Typography>{`${profile.firstName} ${profile.lastName}`}</Typography>
      </div>
    </Paper>
  )

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

  const photosSection = (
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
          <ImageList cols={3} gap={10} style={{padding: '0 10px'}} >
            {photos.map(photo => (
              <ImageListItem key={photo.src}>
                <img
                  src={`${photo.src}?w=164&h=164&fit=crop&auto=format`}
                  srcSet={`${photo.src}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  alt='user photo'
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
      </List>
    </Paper>
  )

  const videosSection = (
    <Paper id='videos-section' className={classes.section} >
      <List subheader={<li />} >
        <ListSubheader 
          disableSticky={true}
        >
          {t('Videos')}
        </ListSubheader>
          <ImageList cols={3} gap={10} style={{padding: '0 10px'}} >
            {photos.map((photo) => (
              <ImageListItem key={photo.src}>
                <img
                  src={`${photo.src}?w=164&h=164&fit=crop&auto=format`}
                  srcSet={`${photo.src}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  alt='user video'
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
      </List>
    </Paper>
  )

  const groupsSection = (
    <Paper
      id='groups-section'
      className={classes.section}
    >
      <List
        subheader={<li />}
      >
        <ListSubheader 
          disableSticky={true}
          id="nested-list-subheader-2"
        >
          {t('Groups')}
        </ListSubheader>

        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
        >
            <Avatar component={NavLink} to={`/dialogs`} sx={{ width: 56, height: 56 }} src="https://bipbap.ru/wp-content/uploads/2019/05/86ae0b2400c92d333751c8d9a9ae68e4.png" />
            <Avatar component={NavLink} to={`/dialogs`}sx={{ width: 56, height: 56 }} src="https://pbs.twimg.com/profile_images/378800000585198636/04dcbc783bd6487e8bbff8dcde01f389.jpeg" />
            <Avatar component={NavLink} to={`/dialogs`}sx={{ width: 56, height: 56 }} src="https://liubavyshka.ru/_ph/114/2/403171597.jpg" />
            <Avatar component={NavLink} to={`/dialogs`}sx={{ width: 56, height: 56 }} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZmOKyVtbzYba6v7WGI4a7GjDQM152jAIBrA&usqp=CAU" />
            <Avatar component={NavLink} to={`/dialogs`}sx={{ width: 56, height: 56 }} src="https://pbs.twimg.com/profile_images/378800000585198636/04dcbc783bd6487e8bbff8dcde01f389.jpeg" />
            
        </Stack>
      </List>
    </Paper>
  )

  const pagesSection = (
    <Paper
      id='pages-section'
      className={classes.section}
    >
      <List subheader={<li />} >
        <ListSubheader
          component={NavLink} to={`/dialogs`}
          disableSticky={true}
        >
          {t('Pages')}
        </ListSubheader>
        
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
            <Avatar component={NavLink} to={`/dialogs`} sx={{ width: 56, height: 56 }} src="https://liubavyshka.ru/_ph/114/2/403171597.jpg" />
            <Avatar component={NavLink} to={`/dialogs`} sx={{ width: 56, height: 56 }} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZmOKyVtbzYba6v7WGI4a7GjDQM152jAIBrA&usqp=CAU" />
            <Avatar component={NavLink} to={`/dialogs`} sx={{ width: 56, height: 56 }} src="https://bipbap.ru/wp-content/uploads/2019/05/86ae0b2400c92d333751c8d9a9ae68e4.png" />
            <Avatar component={NavLink} to={`/dialogs`} sx={{ width: 56, height: 56 }} src="https://pbs.twimg.com/profile_images/378800000585198636/04dcbc783bd6487e8bbff8dcde01f389.jpeg" />
        </Stack>
      </List>
    </Paper>
  )

  if(true) {
    
  }

  return (
    <div
      className={classes.panel}
    >
      { infoSection }
      { photosSection }
      { videosSection }
      { groupsSection }
      { pagesSection }

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
