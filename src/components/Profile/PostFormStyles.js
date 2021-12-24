import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  postSettingsMenuRoot: {
    border: `1px solid ${theme.palette.divider}`
  },
  resize: theme.typography.body2,
  addMedia: {
    '& > *': {
      margin: theme.spacing(1) / 3,
    }
  },
  input: {
    display: 'none'
  },
}))