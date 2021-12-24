import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  rightPanel: {
    '@media (max-width: 860px)': {
      display: 'none'
    },
    marginLeft: 16
  },
  topNav: {
  },
  connection: {
    padding: theme.spacing(2),
    display: 'flex'
  },
  emptyList: {
    padding: theme.spacing(2),
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    marginRight: 16
  }
}))