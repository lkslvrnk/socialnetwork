import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  comment: {
    display: 'flex',
    padding: props => props.isReply ? 0 : '0px 16px',
    marginTop: 12,
  },
  creatorAvatar: {
    width: 40,
    height: 40
  },
  commentBody: {
    borderRadius: '16px',
    borderTopLeftRadius: 0,
    paddingLeft: 8,
    position: 'relative'
  },
  creatorNameLink: {
    color: theme.palette.text.primary,
    textDecoration: 'none'
  },
  headerAndContent: {
    padding: '4px 8px',
  },
  header: {
    marginBottom: 8
  },
  creatorName: {
    color: theme.palette.text.primary,
  },
  date: {
    color: theme.palette.text.secondary,
  },
  content: {
    wordBreak: "break-word",
    padding: `4px 0`,
    
    borderTopLeftRadius: 0,
    overflow: 'hidden',
  },
  replyButton: {
    cursor: 'default'
  },
  replyButtonActive: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  underComment: {
    ...theme.styles.flexRowAlignCenter,
    padding: theme.spacing(0.5, 1),
    color: theme.palette.text.secondary,
    fontSize: '0.840rem',
    fontWeight: 500,
    wordBreak: "keep-all",
    height: 24
  },
  underCommentDivider: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  createCommentButton: {
    marginLeft: theme.spacing(1),
    width: 40,
    height: 40,
  },
  reactionsInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  mostPopularReactionsItem: {
    display: 'block',
    marginRight: 2,
    height: 16,
    width: 16,
    backgroundSize: '100%'
  },
  repliesContainer: {
    marginLeft: theme.spacing(8),
    marginBottom: 8
  },
  metadateContainer: {
    border: `1px solid ${theme.palette.common.paper}`,
    background: theme.palette.grey['600'],
    right: 10,
    alignItems: 'center'
  },
  loadMoreRepliesButton: {
    cursor: 'pointer',
    ...theme.styles.flexRowAlignCenter,
    margin: `${theme.spacing(1)}px ${theme.spacing(1.5)}px ${theme.spacing(2)}px 0`,

  },
  toggleRepliesVisibilityButton: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  newReplyFieldContainer: {
    marginTop: 8,
    marginRight: 8
  },
}));