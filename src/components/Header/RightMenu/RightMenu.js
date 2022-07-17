import React, {Fragment, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {connect} from 'react-redux'
import {compose} from 'redux'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Divider from '@material-ui/core/Divider';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Popover from '@material-ui/core/Popover';
import TranslateIcon from '@material-ui/icons/Translate';
import { useStyles } from './RightMenuStyles';

const RightMenu = React.memo((
  {appearanceSwitcher, onSetLanguage, toggleRightMenu, renderExitListItem, languages, language, anchor}
) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [section, setSection] = useState(0) // Это свойство определяет что должно отображаться в окне

  const renderMainMenuButtons = (
    <List dense>
      {appearanceSwitcher}
      
      <ListItem button onClick={() => setSection(1)}>
        <ListItemIcon><TranslateIcon /></ListItemIcon>
        <ListItemText style={{whiteSpace: 'nowrap'}}>
          {t('Change language')}
        </ListItemText>
      </ListItem>

      {renderExitListItem}
    </List>
  );

  const renderLanguageSelector = (
    <Fragment>
      <RightMenuHeader>
        <div className={classes.languageSelectorHeader}>
          <IconButton
            size='small'
            onClick={() => setSection(0)}
            children={<ArrowBackIcon />}
          />
          <Typography variant='body2'>
            {t('Change language')}
          </Typography>
        </div>
      </RightMenuHeader>

      <Divider />
      <List dense style={{paddingTop: 0}}>

      {languages.map(item => (
        <ListItem
          key={item.short}
          button onClick={() => onSetLanguage(item.short)}
          selected={language === item.short}
          dense
        >
          <ListItemText>
            {item.name}
          </ListItemText>
        </ListItem>
      ))}
      </List>
    </Fragment>
  )

  let renderedContent = renderMainMenuButtons
  if(section === 1) {
    renderedContent = renderLanguageSelector
  }
  
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
        {renderedContent}
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

