import React from 'react';
import './RightProfilePanel.css'
import Paper from "@material-ui/core/Paper";
import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import { withStyles } from "@material-ui/core/styles";
import {useTranslation} from 'react-i18next';
import './Styles.css';
import { useStyles } from './RightProfilePanelStyles.js';

const RightProfilePanel = ({onPhotoClick, pictures, infoSection}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const preparedPhotos = []
  for(let i = 0; i < 3; i++) {
    if(pictures[i]) {
      preparedPhotos.push(pictures[i])
    }
  }

  const photosSection = preparedPhotos.length > 0 &&
    <Paper
      id='photos-section'
      className={classes.section}
    >
      <List
        subheader={<li />}
        style={{paddingBottom: 15}}
      >
        <ListSubheader disableSticky={true}>
          {t('Photos')}
        </ListSubheader>

        <div className={classes.photos}>
          {preparedPhotos.map((photo, index) => (
            <div
              key={photo.src}
              onClick={() => onPhotoClick(index)}
              className={classes.photo}
              style={{ backgroundImage: `url(${photo.src})` }}
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
        Privacy  · Terms  · Advertising  · Ad Choices   · Cookies  ·   · Social Network © 2022
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
