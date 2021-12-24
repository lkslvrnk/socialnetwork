import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    leftNav: {
      position: 'fixed',
      paddingLeft: theme.spacing(1),
      display: 'grid',
      gridGap: 8,
    },
    leftNavContainer: {
      width: 150,
      '@media (max-width: 950px)': {
        width: theme.spacing(8)
      },
      [theme.breakpoints.down("xs")]: {
        display: 'none'
      },
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
    '@media (max-width: 950px)': {
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
