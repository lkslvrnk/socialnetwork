import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  drawerRoot: {
    '@media (min-width: 600px)': {
      display: 'none'
    },
  },
  rightMenuButton: {
    marginLeft: 16,
    '@media (max-width: 599px)': {
      display: 'none'
    },
  },
  selectNotLoggedUserLanguage: {
    marginLeft: 'auto'
  },
  logo: {
    marginRight: 8,
    flexShrink: 0,
    height: 40,
    borderRadius: '10em',
  },
  upButtonWrapper: {
    borderRadius: 1000,
    marginLeft: 8,
    transition: 'width 0s 0s',
    height: 40,
    position: 'relative',
    overflow: 'hidden'
  },
  upButtonWrapperVisible: {
    width: '40px',
    transitionDelay: '0s',
  },
  upButtonWrapperHidden: {
    width: '0px',
    transitionDelay: '0.15s',
  },
  upButton: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  upButtonVisible: {
    'transition-delay': '0s',
    opacity: 1
  },
  upButtonHidden: {
    'transition-delay': '0s',
    opacity: 0
  },
  leftSide: {
    display: 'flex',
    width: 290,
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center'
  },
  rightSide: {
    display: 'flex',
    width: 290,
    flexShrink: 1,
    flexGrow: 1,
    justifyContent: 'flex-end',
    '@media (max-width: 599px)': {
      width: 'auto',
      flexGrow: 0
    },
  },
  medium: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 599px)': {
      display: 'none'
    },
  },
  mediumButton: {
    border: `1px solid ${theme.palette.divider}`,
    width: 40,
    height: 40,
    padding: `0 ${theme.spacing(1)}`
  },

}));






