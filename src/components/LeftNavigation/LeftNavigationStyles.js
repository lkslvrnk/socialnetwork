import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    // leftNav: {
    //   position: 'fixed',
    //   paddingLeft: theme.spacing(1),
    //   display: 'grid',
    //   gridGap: 8,
    //   left: 0
    // },
    // leftNavContainer: {
    //   width: 150,
    //   '@media (max-width: 950px)': {
    //     width: theme.spacing(8)
    //   },
    //   [theme.breakpoints.down("xs")]: {
    //     display: 'none'
    //   },
    //   flexShrink: 0
    // },
    leftNav: {
      position: 'fixed',
      paddingLeft: theme.spacing(1),
      display: 'grid',
      gridGap: 8,
      
    },
    leftNavContainer: {
      position: 'relative',
      width: theme.spacing(8),
      '@media (min-width: 1201px)': {
        position: 'absolute',
        // border: '1px solid white',
        left: -150,
        width: 150,
      },
      '@media (min-width: 1001px)': {
        //left: -150,
        width: 150,
      },

      [theme.breakpoints.down("xs")]: {
        display: 'none'
      },
      flexShrink: 0
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
