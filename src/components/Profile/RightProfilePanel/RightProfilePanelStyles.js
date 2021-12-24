import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  panel: {
    display: 'grid',
    gridGap: theme.spacing(2),
    minWidth: 300,
    maxWidth: 300,
  },
  avatarAndName: {
    ...theme.styles.flexColumnCenter
  },
  avatar: {
    margin: `${theme.spacing(1)}px 0`
  },
  name: {
    margin: `${theme.spacing(1)}px 0`
  },
  profileAvatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupsList: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    justifyContent: "space-around"
  },
  collapsedList: {
    paddingTop: '0',
  },
  showAdditionalInfo: {
    height: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,

  },
}))
