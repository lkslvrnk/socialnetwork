import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down("xs")]: {
      display: 'none'
    },
    marginRight: theme.spacing(1),
    width: theme.spacing(5),
    height: theme.spacing(5)
  },
  pickEmojiButton: {
    [theme.breakpoints.down("xs")]: {
    },
  },
  createCommentButton: {
    marginLeft: 8
  },
  fieldTextSize: theme.typography.body2,
  fieldContainer: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  field: {
    display: 'flex',
  },
  underField: {
    ...theme.styles.flexRowAlignCenter,
    padding: theme.spacing(0.5, 1),
    color: theme.palette.text.secondary,
    fontSize: '0.840rem',
    fontWeight: 500,
    wordBreak: "keep-all"
  },
}))