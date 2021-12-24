import React, {Fragment, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {connect} from 'react-redux'
import {compose} from 'redux'
import SmallListItemIcon from '../../Common/SmallListItemIcon.js'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Divider from '@material-ui/core/Divider';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Popover from '@material-ui/core/Popover';
import {makeStyles} from "@material-ui/core/styles";
import TranslateIcon from '@material-ui/icons/Translate';

const useStyles = makeStyles(theme => ({
  rightMenu: {
    minWidth: '250px'
  },
}));

const RightMenu = React.memo((
  {appearanceSwitcher, onSetLanguage, toggleRightMenu, renderExitListItem, languages, language, anchor}
) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const renderMainMenuButtons = (
    <List>
      {appearanceSwitcher}
      <ListItem button onClick={() => setShowLanguageMenu(true)}>
        <ListItemIcon><TranslateIcon /></ListItemIcon>
        <ListItemText>{t('Change language')}</ListItemText>
      </ListItem>
      {renderExitListItem}
    </List>
  );

  const renderLanguageSelector = (
    <Fragment>
      <RightMenuHeader>
        <IconButton button onClick={() => setShowLanguageMenu(false)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='body2' >{t('Change language')}</Typography>
      </RightMenuHeader>
      <Divider />
      <List dense style={{paddingTop: 0}}>
      {languages.map(item => {
        return (
          <ListItem
            key={item.short}
            button onClick={() => onSetLanguage(item.short)}
            selected={language === item.short}
          >
            <SmallListItemIcon children={<Typography variant='h5' >{item.flag}</Typography>}/>
            <ListItemText>
              <Typography variant='body2' >{item.name}</Typography>
            </ListItemText>
          </ListItem>
        )})}
      </List>
    </Fragment>
  )
  
  return (
    <Popover
      anchorEl={anchor}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      open={Boolean(anchor)}
      onClose={toggleRightMenu}
      
      disableScrollLock
    >
      <div className={classes.rightMenu}>
        {!showLanguageMenu ? renderMainMenuButtons : renderLanguageSelector}
      </div>
    </Popover>
  );
})

const RightMenuHeader = ({children}) => {
  return (
    <div style={{padding: 0, display: 'flex', alignItems: 'center'}}>
      {children}
    </div>
  )
}

let mapStateToProps = state => {
  return {
    language: state.app.language,
  }
}

export default compose(
  connect(mapStateToProps, {}),
)(RightMenu);

