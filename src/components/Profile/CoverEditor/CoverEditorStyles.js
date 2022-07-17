import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    disableCropper: {
      position: 'absolute',
      inset: 0
    },
    cropper: {
      maxWidth: 800,
      position: 'relative'
    },
    dialogContent: {
      flexGrow: 0,
      overflow: 'visible'
    },
    uploadPhoto: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }
})