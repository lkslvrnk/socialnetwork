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
      '@media (max-width: 860px)': {
        marginRight: 0,
      },
    },
    subscription: {
      padding: theme.spacing(2),
      display: 'flex'
    },
    noSubscriptions: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16
    },
    avatar: {
      width: 80,
      height: 80,
      marginRight: 16
    },
    loadMore: {
      display: 'flex',
      justifyContent: 'center'
    }
  }
});
