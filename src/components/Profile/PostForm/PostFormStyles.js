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
  addPhotoIconWrapper: {
    marginLeft: 16, display: 'flex', alignItems: 'center'
  },
  mediaLoadingProgress: {
    marginBottom: 8
  },
  files: {
    padding: 8
  },
  loadingFile: {
    display: 'flex', alignItems: 'center', marginBottom: 8
  },
  loadingFileName: {
    marginRight: 16,
    wordBreak: 'break-all'
  },
  textFieldWrapper: {
    padding: '0 8px',
    display: 'flex',
    position: 'relative'
  },
  postSettingsButtonWrapper: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    marginRight: 16
  },
  settingsItemCheckbox: {
    padding: 0, marginRight: 16
  }
}))