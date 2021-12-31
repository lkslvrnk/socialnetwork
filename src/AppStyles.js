import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    appContainer: {
      minWidth: 300,
    },
    appBody: {
      marginTop: 64,
      [theme.breakpoints.up("sm")]: {
        display: 'flex',
        justifyContent: 'center',
      },
      // border: "1px solid white",
    },
    content: {
      position: 'relative',
      minWidth: 300,
      maxWidth: 900,
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      flexGrow: 1,
      flexShrink: 1,
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
