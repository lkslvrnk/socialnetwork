
import { makeStyles } from "@material-ui/core";
import { deepOrange } from '@material-ui/core/colors';

export const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2
  },
  avatarBorder: {
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: 100
  },
  card: {
    overflow: 'visible',
  },
  postHeader: {
    padding: '8px 8px 8px 16px'
  },
  media: {
  },
  skeletonMedia: {
    height: 20
  },
  actions: {
    width: 30,
    height: 30,
    margin: 10
  },
  container: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridTemplateRows: 400,
  },
  embeddedPostMedia: {
    margin: '0 16px', 
    border: '1px solid rgb(255, 255, 255, 0.12)', 
    borderRadius: 3, 
    paddingBottom: 16
  },
  avatar: {
    width: 50,
    height: 50,
    background: deepOrange[500]
  },
  reactionMiniImage: {
    display: 'block'
  },
  menuItemPreloader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  postActionsButtons: {
    fontSize: '24px' 
  },
  newPostActions: {
    margin: '0 8px'
  },
  shareMenu: {
    minWidth: 400,
    maxWidth: 400
  },
  gridList: {
  },
  addMedia: {
    '& > *': {
      margin: theme.spacing(1) / 3,
    }
  },
  input: {
    display: 'none'
  },
  resize: theme.typography.body2,
  selectSortingRoot: {
    fontSize: theme.typography.body2.fontSize
  },
  postMoreButton: {
    marginRight: 8,
    marginTop: 4
  },
  contentContainer: {
    padding: '8px 16px',
    wordBreak: "break-word"
  },
  postReactionsAndCommentsInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 24px',
    justifyContent: 'space-between'
  },
  postReactionsInfo: {
    display: 'flex',
    alignItems: 'center',
    height: 21
  },
  postCommentsInfo: {

  },
  postDivider: {
    padding: '0 16px'
  },
  postActions: {
    padding: '4px 0 4px 0',
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  currentReactionImage: {
    position: 'absolute',
    top: -3,
    left: -3
  },
  currentReactionImageContainer: {
    width: 24,
    height: 24,
    overflow: 'visible',
    position: 'relative'
  },

  reactionsContainer: {
    background: '#424242',
    borderRadius: '3em',
    padding: 4,
    display: 'flex'
  },
  reactionContainer: {
    width: 42,
    height: 40,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  reactionImage: {
    cursor: 'pointer',
    display: 'block',
  },
  postHeaderMenuAnchor: {
    borderRadius: '3em',
    cursor: 'pointer',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mostPopularReactionsItem: {
    display: 'block',
    marginRight: 2,
    height: 26,
    width: 26,
    backgroundSize: '100%'
  },
  hide: {
    display: 'none'
  }
}))