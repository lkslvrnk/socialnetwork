import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => {

  let likesAndDislikes = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  }

  return {
    comment: {
      display: 'flex',
      wordBreak: 'break-all',
      alignItems: 'start',
      '&:hover $menuButton': {
        visibility: 'visible'
      }
    },
    rootComment: {
      paddingLeft: 16,
      paddingRight: 8,
    },
    reply: {
      // paddingLeft: 0,
      // paddingRight: 0
    },
    menuButton: {
      visibility: 'hidden',
    },
    dropDownIconWrapper: {
      height: 22, width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    avatarBorder: {
      border: `2px solid ${theme.palette.divider}`,
      borderRadius: 100
    },
    nameAndDate: {
      display: 'flex',
      justifyContent: 'start',
      flexWrap: 'wrap'
    },
    commentBody: {
      borderRadius: theme.spacing(2),
      borderTopLeftRadius: 0,
      paddingLeft: theme.spacing(1),
      position: 'relative',
      flexGrow: 1
    },
    creatorNameLink: {
      color: theme.palette.text.primary,
      textDecoration: 'none'
    },
    headerAndContent: {
      padding: theme.spacing(0.5, 1),
    },
    header: {
      display: 'flex',
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
      marginLeft: 2
    },
    replyButtonActive: {
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    repliedName: {
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    underComment: {
      ...theme.styles.flexRowAlignCenter,
      padding: theme.spacing(0, 1),
      color: theme.palette.text.secondary,
      fontSize: '0.840rem',
      fontWeight: 500,
      wordBreak: "keep-all",
      marginLeft: props => props.isReply ? 36 : 52,
      marginRight: 10,
      flexWrap: 'wrap',
      marginBottom: theme.spacing(1.5),
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
      alignItems: 'center',
      marginRight: 8
    },
    likes: {
      ...likesAndDislikes
    },
    likesCount: {
      marginLeft: 4, marginRight: 8
    },
    dislikes: {
      ...likesAndDislikes
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
      marginLeft: theme.spacing(7.5),
      marginBottom: theme.spacing(1),
    },
    metadateContainer: {
      border: `1px solid ${theme.palette.common.paper}`,
      background: theme.palette.grey['600'],
      right: 10,
      alignItems: 'center'
    },
    loadMoreRepliesButton: {
      cursor: 'pointer',
      display: 'flex',
      margin: `${theme.spacing(1)}px ${theme.spacing(1.5)}px ${theme.spacing(2)}px 0`,
      "& > :first-child": {
        marginRight: theme.spacing(2)
      },
      position: 'relative',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    toggleRepliesVisibilityButton: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      position: 'relative'
    },
    newReplyFieldContainer: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    reactionButton: {
      cursor: 'pointer'
    }
  }
})