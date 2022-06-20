import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    height: '100%',
    [theme.breakpoints.down("xs")]: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: 'auto',
    },
    overflow: 'hidden',
    minWidth: 300,
    ...theme.styles.flexColumn,
    flexGrow: 1,
  },
  chat: {

  },
  loading: {
    position: 'absolute',
    top: 51, bottom: 55,
    left: 0, right: 0, 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: theme.palette.background.paper,
    // border: '1px solid white',
    zIndex: 2,
    // background: 'red'
  },
  root: {
    // backgroundColor: 'inherit',
    position: 'relative',
    marginBottom: 4,
    
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  dayContainer: {
    // border: '1px solid white',
    height: 30,
    width: 0,
    padding: 0,
    cursor: 'default',
    lineHeight: '2em',
    display: 'flex',
    justifyContent: 'center',
    // position: 'relative',
    margin: '0px auto'
  },
  day: {
    position: 'absolute',
    // border: '1px solid white',
    marginTop: 2,
    display: 'flex',
    justifyContent: 'center',
    // padding: theme.spacing(0.5, 2),
    color: theme.palette.type === 'dark' ? '#fff' : 'black',
    borderRadius: 5,
    background: 'rgba(0, 0, 0, 0.23)',//theme.palette.type === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400],
    '& p': {
      whiteSpace: 'nowrap'
    },
  },
  header: {
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    // justifyContent: 'space-between',
    [theme.breakpoints.down("sm")]: {
    },
    minHeight: 50,
    // background: theme.palette.type === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]
  },
  toChatsPreviewsButton: {
    marginLeft: 8
  },
  interlocutorNameAndConnectionStatus: {
    // height: 36,
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center'
  },
  chatMenuAndInterlocutorAvatar: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 8
  },
  headerAvatar: {
    margin: theme.spacing(1)
  },
  moreMessagesProgress: {
    top: 55,
    right: 10,
    position: 'absolute'
  },
  dialogueBody: {
    // border: '1px solid red',
    // position: 'relative',
    display: 'flex',
    flexDirection: 'column-reverse', // чтобы при появлении клавиатуры не сбивалась позиция скролбара
    // justifyContent: 'center',
    // height: 0,
    flexGrow: 1,
    // overflowAnchor: 'revert',
    overflowY: 'scroll',
    overflowX: 'hidden',
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
    overflowAnchor: 'none'
  },
  loadPrev: {
    // flexShrink: 0,
    // flexGrow: 1,
    height: 40,
    width: 50,
    position: 'absolute',
    // zIndex: 1,
     top: 0,
    // border: '1px solid white'
  },
  loadNext: {
    // flexShrink: 0,
    // flexGrow: 1,
    height: 30,
    width: 50,
    position: 'absolute',
    bottom: 0,
    // border: '1px solid yellow',

    // zIndex: 1
  },
  container2: {
  },
  line: {
  },
  toBottom: {
    background: theme.palette.primary.main,
    position: 'absolute',
    top: -60,
    right: 20,
    zIndex: 1,
    display: 'none'
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  avatarBorder: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    borderRadius: 100
  },
  avatarBorderOnline: {
    border: `3px solid #44b700`,
    // '-webkit-box-shadow': '0px 0px 7px 4px rgba(68, 183, 0, 0.2)',
    // '-moz-box-shadow': '0px 0px 7px 4px rgba(68, 183, 0, 0.2)',
    // 'box-shadow': '0px 0px 7px 4px rgba(68, 183, 0, 0.2)'
  }, 
  avatarBorderOffline: {
    border: `3px solid ${theme.palette.background.paper}`
  }
}));
