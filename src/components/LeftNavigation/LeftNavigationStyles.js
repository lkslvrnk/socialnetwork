import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    leftNav: {
      position: 'fixed',
      paddingLeft: theme.spacing(1),
      display: 'grid',
      gridGap: 8
    },
    leftNavContainer: {
      position: 'relative',
      width: theme.spacing(7),
      right: '-4px',
      '@media (min-width: 1201px)': {
        position: 'absolute',
        left: -150,
        width: 150,
      },
      '@media (min-width: 1001px)': {
        width: 150,
      },
      [theme.breakpoints.down("xs")]: {
        display: 'none'
      },
      flexShrink: 0,
    },
    leftNavItem: {
      display: 'flex',
      alignItems: 'center',
    },
    leftNavItemText: {
      width: 100,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginLeft: theme.spacing(1)
    },
    '@media (max-width: 1001px)': {
      leftNavItemText: {
        display: 'none',
      },
    },
    '@media (max-width: 1300px)': {
      leftNav: {
      }
    },
  }
});
