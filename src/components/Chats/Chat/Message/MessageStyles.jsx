import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  
  const isDark = theme.palette.type === 'dark'
  const leftMessageColor = isDark ? theme.palette.grey[700] : theme.palette.grey[300]
  const rightMessageColor = isDark ? theme.palette.secondary.main : theme.palette.secondary.light

  return {
    deleting: {
      position: 'absolute',
      top: 0, bottom: 0, left: 0, right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10
    },
    moreActionButton: {
      '&:hover': {
        background: theme.palette.divider
      }
    },
    repliedWrapper: {
      display: 'flex',
      padding: 4,
      margin: 4,
      marginBottom: 0,
      marginLeft: 2,
      flexGrow: 1,
      borderRadius: 4,
      '&:hover': {
        background: theme.palette.divider,
        cursor: 'pointer'
      },
      minWidth: 0
    },
    repliedBorder: {
      borderLeft: theme.palette.type === 'light' ? `2px solid black` : `2px solid white`,
      marginRight: 8,
    },
    repliedHeader: {
      lineHeight: 1.1
    },
    repliedMessageText: {
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    replied: {maxWidth: '97%'},
    moreActionsButtonActive: {
      background: theme.palette.divider
    },
    deletingLeft: {
      background: leftMessageColor
    },
    deletingRight: {
      background: rightMessageColor
    },
    container: {
      padding: `1px 10px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      "&:hover $actions": {
        visibility: 'visible',
      },
      "&:hover $underActionsButton": {
        height: 0,
        width: 0,
      },
      transition: 'background-color 0.5s ease'
    },
    leftMessageContainer: {
      flexDirection: 'row-reverse'
    },
    rightMessageContainer: {
      flexDirection: 'row'
    },
    hidden: {
      visibility: 'hidden'
    },
    visible: {
      visibility: 'visible'
    },
    messageLabel: {
      position: 'absolute',
      background: theme.palette.secondary.main,
      padding: 5,
      top: 4,
      borderRadius: 10,
      fontSize: theme.typography.caption.fontSize
    },
    leftMessageLabel: {
      right: -5,
    },
    rightMessageLabel: {
      left: -5,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 30,
      minWidth: 20,
      margin: '0 8px'
    },
    leftMessageActions: {
      flexDirection: 'row'
    },
    rightMessageActions: {
      flexDirection: 'row-reverse'
    },
    actionsButtonCont: {
      position: 'relative',
    },
    underActionsButton: {
      top: 0,
      left: 0,
      position: 'absolute',
      '-webkit-transition': 'height 1s,width 1s',
      '-moz-transition': 'height 1s,width 1s',
        '-o-transition': 'height 1s,width 1s',
       '-ms-transition': 'height 1s,width 1s',
           transition: 'height 1s,width 1s',
      height: 30, 
      width: 30,
    },
    message: {
      position: 'relative',
      maxWidth: '70%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      padding: theme.spacing(1),
    },
    messageContent: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    rightMessage: {
      background: rightMessageColor,
      borderTopLeftRadius: '0.4em',
      borderBottomLeftRadius: '0.4em',
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        borderTop: '7px solid transparent',
        left: '100%',
      }
    },
    leftMessage: {
      background: leftMessageColor,
      borderTopRightRadius: '0.4em',
      borderBottomRightRadius: '0.4em',
      '&:before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        borderTop: '7px solid transparent',
        right: '100%',
      }
    },
    firstRightMessage: {
      borderTopRightRadius: '0.4em'
    },
    singleRightMessage: {
      borderTopRightRadius: '0.4em'
    },
    firstLeftMessage: {
      borderTopLeftRadius: '0.4em'
    },
    singleLeftMessage: {
      borderTopLeftRadius: '0.4em'
    },
    lastLeftMessage: {
      '&:before': {
        borderRight: `7px solid ${leftMessageColor}`
      }
    },
    lastRightMessage: {
      '&:after': {
        borderLeft: `7px solid ${rightMessageColor}`
      }
    },
    textAndInfo: {
      '& a':{
        color: theme.palette.primary.dark,
        textDecoration: 'underline'
      },
      margin: '0 6px',
      wordBreak: 'break-word', // Переност слова, если оно не влезает
      whiteSpace: 'pre-line' // Благодаря этому работате перенос с \n
    },
    messageInfo: {
      float: 'right',
      position: 'relative',
      top: 6,
      left: 8,
      display: 'flex'
    },
    statusIcon: {
      display: 'block',
      marginLeft: 4
    },
    errorStatusIcon: {
      background: 'white',
      borderRadius: 10,
      height: 16
    }
  }
});