
import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({

  reactionsContainer: {
    background: theme.palette.background.paper,
    borderRadius: '3em',
    padding: 4,
    display: 'flex',
    // flexWrap: 'wrap',
    // justifyContent: 'center',
  },
  reactionContainer: {
    '@media (max-width: 400px)': {
      width: 28,
      height: 28,
    },
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  reactionImage: {
    width: 30,
    height: 30,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'visible',
    cursor: 'pointer',
    display: 'block',
    '&:hover': {
      width: 36,
      height: 36
    },
    '@media (max-width: 400px)': {
      width: 22,
      height: 22,
      '&:hover': {
        width: 28,
        height: 28
      }
    },
  },

}));