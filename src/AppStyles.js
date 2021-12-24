import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    appContainer: {
      minWidth: 400,
    },
    appBody: {
      marginTop: 64,
      [theme.breakpoints.up("sm")]: {
        display: 'flex',
        justifyContent: 'center',
      },

    },
    content: {
      minWidth: 400,
      maxWidth: 900,
      paddingRight: theme.spacing(4),
      paddingBottom: theme.spacing(2),
      flexGrow: 1,
      [theme.breakpoints.down("xs")]: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
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
  }
});
