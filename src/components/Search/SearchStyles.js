import { alpha, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    root: {
      display: 'flex',
    },
    panel: {
      '@media (max-width: 860px)': {
        display: 'none',
      },
    },
    search: {
      flexGrow: 1,
      marginRight: theme.spacing(2),
      '@media (max-width: 860px)': {
        marginRight: 0,
      },
      '& > div': {
        marginBottom: theme.spacing(1),
      },
    },
    result: {
      padding: theme.spacing(1),
      display: 'flex'
    },
    avatar: {
      // width: 80,
      // height: 80,
      marginRight: 16
    },
    inputRoot: {
      color: 'inherit',
      width: '100%',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
    },
    searchInput: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreButtonContainer: {
      position: 'relative'
    },
    moreButtonLoading: {
      position: 'absolute', top: 0, right:0, left:0, bottom: 0, display: 'flex', justifyContent: 'center'
    }
  }
});
