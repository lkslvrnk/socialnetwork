import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  let spacing2x = theme.spacing(2)
  let spacing1x = theme.spacing(1)

  return {
    grow: {
      flexGrow: 1,
    },
    rightPanel: {
      '@media (max-width: 860px)': {
        display: 'none'
      },
      marginLeft: spacing2x,
    },
    topNav: {
      position: 'sticky',
      top: 48,
      marginBottom: 8,
      border: `1px solid ${theme.palette.divider}`,
      zIndex: 1
    },
    connection: {
      padding: spacing2x,
      display: 'flex'
    },
    emptyList: {
      padding: spacing2x,
      flexDirection: 'column',
      display: 'flex',
      alignItems: 'center'
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
    buttonWrapper: {
      position: 'relative',
    },
    avatar: {
      width: theme.spacing(10),
      height: theme.spacing(10),
      marginRight: spacing2x,
    },
    loadMore: {
      ...theme.styles.flexCenterHoriz,
      marginBottom: spacing2x,
    },
    nameAndMenu: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: spacing1x
    },
    ownerInfo: {
      padding: spacing1x,
      '@media (max-width: 860px)': {
        padding: theme.spacing(0.5, 1)
      },
      display: 'flex',
    },
    navPopper: {
      border: `1px solid ${theme.palette.divider}`,
    }
  }
})