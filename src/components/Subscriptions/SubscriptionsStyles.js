import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    panel: {
      '@media (max-width: 860px)': {
        display: 'none',
      },
    },
    subscriptions: {
    },
    userFullname: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    subscriptionsList: {
      alignSelf: 'flex-start',
      flexGrow: 1,
      marginRight: theme.spacing(2),
      '& > div': {
        marginBottom: theme.spacing(1),
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
      alignSelf: 'flex-start',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      padding: 16,
      textAlign: 'center',
      '@media (max-width: 860px)': {
        marginRight: 0
      },
    },
    avatar: {
      marginRight: 16
    },
    loadMore: {
      display: 'flex',
      justifyContent: 'center'
    }
  }
});
