import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  selectFile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageControl: {
    display: 'flex', alignItems: 'center'
  },
  editorWrapper: {
    display: 'flex', justifyContent: 'center', position: 'relative'
  },
  editorBlock: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0
  }
}))
