import { alpha, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  const inputInput = {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  }

  return {
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },

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
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      ...inputInput,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(18),
        '&:focus': {
          width: theme.spacing(22),
        },
      },
    },
    inputInputWithOpenPanel: {
      ...inputInput,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(22),
      },
    },
    searchPanel: {
      border: `1px solid ${theme.palette.divider}`,
      position: 'absolute',
      marginTop: 8,
      width: theme.spacing(29),
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        width: 'auto',
        left: theme.spacing(1),
        right: theme.spacing(1),
      }
    },
    searchResultItem: {
      display: 'flex',
      //padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
    showAllResults: {
      display: 'block',
      padding: theme.spacing(1.5), textAlign: 'center',
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    preloader: {
      padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
  }
})