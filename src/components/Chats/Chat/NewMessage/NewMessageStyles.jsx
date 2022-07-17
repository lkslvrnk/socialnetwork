import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  const background = theme.palette.type === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]

  return {
    newMessageForm: {
      width: '100%',
      display: 'flex',
      alignItems: 'end'
    },
    sendButtonWrapper: {
      position: 'relative',
      width: 44,
      height: 44,
      borderRadius: '3em',
      background,
      margin: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editMessage: {
      display: 'flex'
    },
    editMessageClose: {
      padding: 8,
    },
    editingMessageText: {
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    editBorder: {
      borderLeft: `2px solid ${theme.palette.secondary.main}`,
      marginRight: 8
    },
    editHeader: {
      color: theme.palette.secondary.main,
      lineHeight: 1.1
    },
    editingMessageWrapper: {
      display: 'flex',
      padding: 4,
      margin: 4,
      marginBottom: 0,
      marginLeft: 0,
      flexGrow: 1,
      borderRadius: 4,
      '&:hover': {
        background: theme.palette.divider,
        cursor: 'pointer'
      },
      minWidth: 0
    },
    fieldCont: {
      margin: 4,
      flexGrow: 1,
      position: 'relative'
    },
    appendix: {
      position: 'absolute',
      left: '100%',
      bottom: 0,
      width: 40,
      height: 40,
      background,
      '& div': {
        '&:first-child': {
          width: 40, 
          height: 40,
          background: theme.palette.background.paper,
          borderBottomLeftRadius: 20
        }
      }
    },
    root: {
      minHeight: 46,
      display: 'flex',
      alignItems: 'center',
    },
    form: {
      flexGrow: 1,
    },
    field: {
      background,
      padding: '10px',
      borderRadius: '1em',
      borderBottomRightRadius: 0
    },
    font: {
      ...theme.typography.body2,
    },
    underline: {
      "&&&:before": {
        borderBottom: "none"
      },
      "&&:after": {
        borderBottom: "none",
      }
    },
    attachContainer: {
      ...theme.styles.flexCenter,
      width: theme.spacing(6)
    }, 
    attachFileType: {
      ...theme.styles.twoDimensionsCentering,
      width: theme.spacing(4),
      height: theme.spacing(5)
    }
  }
});