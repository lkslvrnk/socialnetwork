import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  
  return {
    chatInfo: {
      flexGrow: 1,
      marginLeft: 8,
      minWidth: 0
    },
    interlocutorNameAndDate: {
      display: 'flex', justifyContent: 'space-between', marginBottom: 2
    },
    unreadCount: {
      background: theme.palette.secondary.main,
      borderRadius: 100,
      padding: 2,
      minWidth: 24,
      textAlign: 'center'
    },
    interlocutorName: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginRight: 12
    },
    lastMessageDate: {
      marginLeft: 'auto'
    },
    lastMessageText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginRight: 12
    },
    lastMessage: {
      display: 'flex',
      justifyContent: 'space-between'
    },
  }
});
