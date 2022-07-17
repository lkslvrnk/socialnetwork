import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  form: {
    width: '100%'
  },
  formContainer: {
    padding: theme.spacing(4),
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    width: '500px',
    [theme.breakpoints.down("xs")]: {
      width: '100%'
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  }
}))
