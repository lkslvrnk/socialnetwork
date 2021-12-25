import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    minHeight: 48, 
    maxHeight: 48
  },
  openDrawerButton: {
  },
  drawerRoot: {
    '@media (min-width: 860px)': {
      display: 'none'
    },
  },
  searchPopover: {
    padding: '20px',
    width: '1000px',
    height: '80%',
    [theme.breakpoints.up("md")]: {
      width: 'auto'
    }
  },
  notifications: {
  },
  menuItem: {
    height: '70px',
    width: '300px',
    [theme.breakpoints.down("xs")]: {
      width: '1000px'
    }
  },
  root: {
    background: theme.palette.action.selected,
    "&:hover": {
      background: theme.palette.action.disabled
    },
    borderRadius: '5em',
    border: 'none',
    margin: '4px',
    color: 'green',
    '&$selected': {
        color: 'blue'
    }
  },
  headerIcons: {
    fontSize: '24px'
  },
  selected: {
  },
  headerTabs: {
    flexGrow: 0,
    alignSelf: 'flex-end',
    [theme.breakpoints.down("xs")]: {
      display: 'none'
    }
  },
  rightMenuButton: {
    '@media (max-width: 860px)': {
      display: 'none'
    },
  },
  showNotificationsButton: {
    marginRight: theme.spacing(1)
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "none"
    },
    border: '1px solid black'
  },
  selectNotLoggedUserLanguage: {
    marginLeft: 'auto'
  },
  logo: {
    marginRight: 16,
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: '10em',
    backgroundSize: 40
  }
}));






