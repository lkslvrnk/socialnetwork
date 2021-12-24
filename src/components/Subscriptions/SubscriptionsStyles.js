import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    panel: {
      '@media (max-width: 860px)': {
        display: 'none',
      },
    },
    subscriptions: {
      display: 'flex',
    },
    subscriptionsList: {
      flexGrow: 1,
      marginRight: theme.spacing(2),
      '& > div': {
        marginBottom: theme.spacing(2),
      },
    },
    subscription: {
      padding: theme.spacing(2),
      display: 'flex'
    },
    avatar: {
      width: 80,
      height: 80,
      marginRight: 16
    }
  }
});
