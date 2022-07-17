import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  
  return {
    chats: {
      display: 'flex',
      height: '100%',
      flexGrow: 1,
      minWidth: 0
    },
    root: {
      flexGrow: 1,
      height: '100%',
      minWidth: 0 // Благодаря этому flex элемент не распирает из-за его широкого контента, например, от текста с white-space: nowrap
    },
    rightPanel: {
      width: 300,
      flexShrink: 0,
      marginLeft: 16,
      '@media (max-width: 860px)': {
        display: 'none'
      },
    },
    rightChatsList: {
      overflowY: 'scroll',
      height: '100%',
      width: 300,
      flexShrink: 0,
      '&::-webkit-scrollbar': {
        background: 'red',
        width: 8,
      },
      '&::-webkit-scrollbar-track': {
        background: theme.palette.background.paper,
      },
      '&::-webkit-scrollbar-thumb': {
        background: theme.palette.divider,
        border: 0
      },
    },
    asideChatsPreviewsWrapper: {
      borderRadius: 4,
      overflow: 'hidden',
      marginLeft: 16,
      minWidth: 300
    },
    widePreviews: {
      paddingBottom: theme.spacing(2),
      marginRight: theme.spacing(2)
    }
  }
});
