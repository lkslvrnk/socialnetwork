import { makeStyles } from "@material-ui/core"

export const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(8),
  },
  form: {
    width: '100%'
  },
  formContainer: {
    padding: theme.spacing(2),
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 400
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  }
}))