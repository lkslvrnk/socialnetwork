import { alpha, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  const inputInput = {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  }

  const back = theme.palette.type === 'dark'
    ? alpha(theme.palette.common.white, 0.15)
    : theme.palette.grey[300]

  const backHover = theme.palette.type === 'dark'
    ? alpha(theme.palette.common.white, 0.25)
    : theme.palette.grey[400]

  return {
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: back,
      '&:hover': {
        backgroundColor: backHover,
      },
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: 'auto',
      },
      maxWidth: 500
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
      position: 'absolute',
      marginTop: 8,
      width: theme.spacing(29),
      overflow: 'hidden',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        width: 'auto',
        left: theme.spacing(1),
        right: theme.spacing(1),
      },
      background: theme.palette.type === 'dark' ? theme.palette.grey[700] : theme.palette.background.paper
    },
    searchResultItem: {
      display: 'flex',
    },
    showAllResults: {
      display: 'flex',
      padding: theme.spacing(1.5),
      textAlign: 'center',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    preloader: {
      padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
  }
})