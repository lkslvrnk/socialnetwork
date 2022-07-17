import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    appBody: {
      position: 'relative',
      minWidth: 300,
      maxWidth: 860,
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      flexGrow: 1,
      flexShrink: 1,
      display: 'flex',
      [theme.breakpoints.down("xs")]: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
      },
      '@media (max-width: 860px)': {
        maxWidth: 600
      },
    },
    '@global': {
      '.main-content': {
        flexGrow: 1,
        alignSelf: 'flex-start',
        marginRight: theme.spacing(2),
        '@media (max-width: 860px)': {
          marginRight: 0,
        },
      },
    },
    upButton: {
      display: 'none',
      borderRadius: 1000,
      background: theme.palette.grey[500],
      position: 'fixed',
      left: 30,
      bottom: 30
    }
  }
});
