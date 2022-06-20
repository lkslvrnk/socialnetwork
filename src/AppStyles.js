import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    content: {
      // marginTop: 64,
      position: 'relative',
      minWidth: 300,
      maxWidth: 860,
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      flexGrow: 1,
      flexShrink: 1,
      [theme.breakpoints.down("xs")]: {
        // marginTop: 0,
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
    photoViewer: {
      display: 'flex'
    },
    photoViewerContainer: {
      position: "absolute",
      border: "2px solid #444",
      padding: 16,
    },
    snack: {
      // '& .SnackbarItem-contentRoot': {
      //   backgroundColor: `${theme.palette.background.paper} !important`,
      //   color: `${theme.palette.text.primary} !important`,
      // },
    },
    success: { backgroundColor: 'purple' },
    error: { backgroundColor: 'blue' },
    warning: { backgroundColor: 'green' },
    info: { backgroundColor: 'yellow' },
    upButton: {
      display: 'none',
      borderRadius: 1000,
      background: theme.palette.grey[500],
      position: 'fixed',
      right: 50,
      bottom: 50
    }
    // snack: {
    //   backgroundColor: 'green !important',
    // }
  }
});
