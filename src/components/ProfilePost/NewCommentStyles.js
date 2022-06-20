import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down("xs")]: {
      // display: 'none'
    },
    width: 36,
    height: 36
  },
  avatarBorder: {
    // border: `2px solid ${theme.palette.divider}`,
    // borderRadius: 100,
    marginRight: theme.spacing(1),
  },
  pickEmojiButton: {
    [theme.breakpoints.down("xs")]: {
    },
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
}))