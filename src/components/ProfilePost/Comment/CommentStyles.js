import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => {

  let forLikesAndDislikes = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  }

  return {
    comment: {
      display: 'flex',
      padding: props => props.isReply ? 0 : theme.spacing(0, 2),
      marginTop: theme.spacing(1.5),
    },
    creatorAvatar: {
      width: theme.spacing(5),
      height: theme.spacing(5),
    },
    nameAndDate: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start'
    },
    commentBody: {
      borderRadius: theme.spacing(2),
      borderTopLeftRadius: 0,
      paddingLeft: theme.spacing(1),
      position: 'relative'
    },
    creatorNameLink: {
      color: theme.palette.text.primary,
      textDecoration: 'none'
    },
    headerAndContent: {
      padding: theme.spacing(0.5, 1),
    },
    header: {
      marginBottom: theme.spacing(0.5),
      display: 'flex'
    },
    creatorName: {
      color: theme.palette.text.primary,
    },
    date: {
      color: theme.palette.text.secondary,
    },
    content: {
      wordBreak: "break-word",
      padding: theme.spacing(0.5, 0),
      borderTopLeftRadius: 0,
      overflow: 'hidden',
    },
    replyButton: {
      cursor: 'default',
      marginLeft: 16
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
      height: theme.spacing(3)
    },
    underCommentDivider: {
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    createCommentButton: {
      marginLeft: theme.spacing(1),
      width: theme.spacing(5),
      height: theme.spacing(5),
    },
    reactionsInfo: {
      display: 'flex',
      alignItems: 'center',
    },
    reactions: {
      display: 'flex',
      alignItems: 'center'
    },
    likes: {
      ...forLikesAndDislikes
    },
    likesCount: {
      marginLeft: 4, marginRight: 8
    },
    dislikes: {
      ...forLikesAndDislikes
    },
    dislikesCount: {
      marginLeft: 4
    },
    mostPopularReactionsItem: {
      display: 'block',
      marginRight: 2,
      height: theme.spacing(2),
      width: theme.spacing(2),
      backgroundSize: '100%'
    },
    repliesContainer: {
      marginLeft: theme.spacing(8),
      marginBottom: theme.spacing(1)
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
      "& > :last-child": {
        marginLeft: theme.spacing(2)
      }
    },
    toggleRepliesVisibilityButton: {
      marginTop: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    newReplyFieldContainer: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
  }
})