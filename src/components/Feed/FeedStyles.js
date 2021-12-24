import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    root: {
      display: 'flex',
    },
    posts: {
      flexGrow: 1,
      marginRight: theme.spacing(2),
      '& > div': {
        marginBottom: theme.spacing(2),
      },
    },
    noPosts: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
      '@media (max-width: 860px)': {
        marginRight: 0
      },
    },
    panel: {
      '@media (max-width: 860px)': {
        display: 'none',
      },
    }
  }
});
