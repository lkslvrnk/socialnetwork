import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  "@global": {
    // для чата нужна особенная разметка, поэтому нужно внести изменения в глобальные стили
    '#app-body': {
      alignItems: 'flex-start',
      height: '100%'
    },
    '#root': {
      height: '100%'
    },
    '#left-nav-wrapper': {
      height: '100%',
    }
  },
  chat: {
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
  loading: {
    position: 'absolute',
    top: 51, bottom: 55,
    left: 0, right: 0, 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: theme.palette.background.paper,
    zIndex: 2,
  },
  messagesSection: {
    position: 'relative',
    marginBottom: 4,
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  messages: {
    paddingBottom: 0
  }, 
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  dayContainer: {
    height: 30,
    width: 0,
    padding: 0,
    cursor: 'default',
    lineHeight: '2em',
    display: 'flex',
    justifyContent: 'center',
    margin: '0px auto',
    marginBottom: 6
  },
  dayDateWrapper: {
    position: 'absolute',
    marginTop: 3,
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette.type === 'dark' ? '#fff' : 'black',
    borderRadius: 5,
    background: 'rgba(0, 0, 0, 0.23)',
    '& p': {
      whiteSpace: 'nowrap'
    },
    userSelect: 'none'
  },
  dayDate: {
    position: 'relative', padding: '4px 16px'
  },
  newMessageSection: {
    minHeight: 54
  },
  dots: {
    width: 10
  },
  loadMoreWrapper: {
    position: 'relative'
  },
  chatNotFound: {
    fontSize: 30
  },
  header: {
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    minHeight: 50,
  },
  toChatsPreviewsButton: {
    marginLeft: 8
  },
  interlocutorNameAndConnectionStatus: {
  },
  interlocutorName: {
    height: 20
  },
  chatMenuAndInterlocutorAvatar: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 8
  },
  chatMenu: {
    marginRight: 8
  },
  moreMessagesProgress: {
    top: 55,
    right: 10,
    position: 'absolute'
  },
  chatBody: {
    display: 'flex',
    flexDirection: 'column-reverse', // чтобы при появлении клавиатуры не сбивалась позиция скролбара
    flexGrow: 1,
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
    height: 40,
    width: 50,
    position: 'absolute',
    top: 0,
  },
  loadNext: {
    height: 30,
    width: 50,
    position: 'absolute',
    bottom: 0
  },
  toBottom: {
    background: theme.palette.primary.main,
    position: 'absolute',
    top: -60,
    right: 20,
    zIndex: 1,
    display: 'none'
  },
  avatarBorder: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    borderRadius: 100
  },
}));
