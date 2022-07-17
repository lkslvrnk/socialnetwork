import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      flexGrow: 1
    },
    feedList: {
      display: 'grid',
      gridGap: theme.spacing(2)
    },
    noFeed: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 16,
      textAlign: 'center'
    },
  }
});
