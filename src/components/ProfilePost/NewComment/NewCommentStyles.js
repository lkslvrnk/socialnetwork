import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down("xs")]: {
    },
    width: 36,
    height: 36
  },
  avatarBorder: {
    marginRight: theme.spacing(1),
  },
  createCommentButton: {
    marginLeft: 8,
    border: `1px solid ${theme.palette.divider}`,
    padding: 2,
    borderRadius: 1000
  },
  fieldTextSize: theme.typography.body2,
  fieldContainer: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  field: {
    display: 'flex',
    alignItems: 'center'
  },
  underField: {
    ...theme.styles.flexRowAlignCenter,
    padding: theme.spacing(0.5, 1),
    color: theme.palette.text.secondary,
    fontSize: '0.840rem',
    fontWeight: 500,
    wordBreak: "keep-all"
  },
  loadingFile: {
    padding: 8,
    display: 'flex',
    alignItems: 'center'
  },
  loadingFileName: {
    marginRight: 16,
    wordBreak: 'break-all'
  },
  loadingFileProgress: {
    width: 100, height: 10
  },
  attachment: {
    maxWidth: 150,
    maxHeight: 150,
  },
  editModeCancelButton: {
    marginLeft: 'auto',
    marginRight: 16
  },
  toggleEmojiPickerButton: { 
    cursor: 'pointer'
  },
  openPhotoExplorerButton: {
    cursor: 'pointer'
  },
  adornments: {
    display: 'flex'
  },
  adornment: {
    marginRight: theme.spacing(1),
    cursor: 'pointer'
  },
}))