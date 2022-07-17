import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  commentsSection: {
    position: 'relative',
    paddingBottom: 8,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 16px'
  },
  stickyNewCommentFieldContainer: {
    padding: `0px 16px`,
    marginTop: 8
  },
  commentsSorting: {
    padding: `0 ${theme.spacing(2)}px`,
    marginBottom: theme.spacing(1),
    ...theme.styles.flexRowAlignCenter,
  },
  toggleCommentsButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCommentsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 4,
  },
  toggleCommentsVisibilityButton: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  sortingMenu: {
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.common.paper,
    border: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing(1)}px 0`
  },
  showMore: {
    cursor: 'pointer', display: 'flex',
    marginBottom: 8,
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));