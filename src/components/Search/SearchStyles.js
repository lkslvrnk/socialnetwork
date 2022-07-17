import { alpha, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    search: {},
    searchResults: {
      marginTop: theme.spacing(1)
    },
    result: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      display: 'flex',
      "&:last-child": {
        marginBottom: "0",
      }
    },
    avatar: {
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
      marginTop: theme.spacing(1),
      position: 'relative',
      height: 40,
      width: 40
    },
    moreButtonLoading: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      justifyContent: 'center',
    },
    loadMore: {
      display: 'flex',
      justifyContent: 'center'
    }

  }
});
