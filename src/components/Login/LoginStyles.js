import { makeStyles } from "@material-ui/core"

export const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(8),
    alignItems: 'flex-start'
  },
  form: {
    width: '100%'
  },
  formContainer: {
    maxWidth: 400,
    padding: theme.spacing(2),
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    minWidth: 200,
    [theme.breakpoints.down("xs")]: {
      width: '100%'
    },
  },
  error: {
    padding: 8,
    display: 'flex',
    justifyContent: 'center',
    whiteSpace: 'wrap',
    wordBreak: 'break-word',
    color: 'red'
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  }
}))