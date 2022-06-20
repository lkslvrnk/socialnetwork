import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  let border = `1px solid ${theme.palette.background.default}`
  
  return {
    container: {
      flexGrow: 1,
      // position: 'relative'
      // width: '100%',
      // height: props => props.dialogueIsOpen ? props.innerHeight - 65 : 'auto',
      //border: '1px solid red',
    },
    root: {
      flexGrow: 1,
      height: '100%',
      minWidth: 0 // Благодаря этому flex элемент не распирает из-за его широкого контента, например, от текста с white-space: nowrap
      // marginRight: 16
    },
    dialoguesListAndDialogue: {

      // width: '100%',
      // [theme.breakpoints.down("sm")]: {
        
      //   justifyContent: 'center',
      // },
      // //display: 'flex',
      // //border: '1px solid red',
    },
    dialoguesListContainer: {

    },
    dialoguesList: {
      // paddingBottom: 16
      // width: '100%',
      // [theme.breakpoints.up("md")]: {
      //   //marginRight: theme.spacing(1),
      //   //display: 'none'
      // },
      // [theme.breakpoints.down("sm")]: {

      // },
      //border: '1px solid red',
    },
    dialogueStub: {
      height: '100%',
      [theme.breakpoints.down("sm")]: {
        display: "none"
      },
      flexGrow: 1,
      //border: '1px solid black'
    },
    dialogueStubContent: {
      ...theme.styles.twoDimensionsCentering,
      height: theme.withPercents(100)
    },
    avatar: {
      width: theme.spacing(7),
      height: theme.spacing(7),
      marginRight: 8
    },
    rightPanel: {
      width: 300,
      flexShrink: 0,
      marginLeft: 16,
      '@media (max-width: 860px)': {
        display: 'none'
      },
    },
    rightChatsListLoading: {
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
      // marginLeft: 16,
    },
    rightChatsList: {
      // border: '1px solid white',
      width: 300,
      flexShrink: 0,
      // marginLeft: 16,
      // overflowY: 'scroll',
      // borderRadius: 4,
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
      // '&::-webkit-scrollbar': {
      //   width: 8,
      //   padding: 1
      // },
      // '&::-webkit-scrollbar-track': {
      //   //background: theme.palette.background.paper,
        
      // },
      // '&::-webkit-scrollbar-thumb': {
      //   background: theme.palette.divider,
      //   border: 0,
      //   margin: 1
      // },
    },
    unreadCount: {
      background: theme.palette.secondary.main,
      borderRadius: 100,
      padding: 2,
      minWidth: 24,
      textAlign: 'center'
    },
  }
});
