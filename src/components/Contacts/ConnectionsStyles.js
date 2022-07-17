import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  let spacing2x = theme.spacing(2)
  let spacing1x = theme.spacing(1)

  return {
    rightPanel: {
      '@media (max-width: 860px)': {
        display: 'none'
      },
      marginLeft: spacing2x,
    },
    buttons: {
      display: 'flex'
    },
    topNav: {
      position: 'sticky',
      top: 48,
      marginBottom: 8,
      border: `1px solid ${theme.palette.divider}`,
      zIndex: 1,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    connection: {
      padding: spacing2x,
      display: 'flex'
    },
    newRequestsCount: {
      background: theme.palette.secondary.main,
      borderRadius: 100,
      padding: 2,
      minWidth: 24,
      textAlign: 'center'
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
      marginRight: spacing2x,
    },
    loadMore: {
      ...theme.styles.flexCenterHoriz,
      padding: spacing2x,
      marginBottom: spacing2x,
    },
    nameAndMenu: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: spacing1x,
    },
    ownerInfo: {
      padding: spacing1x,
      '@media (max-width: 860px)': {
        padding: theme.spacing(0.5, 1)
      },
      display: 'flex',
      marginRight: 16
    },
    ownerAvatar: {
      width: 48,
      height: 48
    },
    navPopper: {
      border: `1px solid ${theme.palette.divider}`,
    },
    selectItemText: {
      padding: 8,
      width: '100%'
    },
    toProfile: {
      display: 'flex',
      flexDirection: 'column'
    },
    navMenuItem: {
      padding: 0
    }
  }
})