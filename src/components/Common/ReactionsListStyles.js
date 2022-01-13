
import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({

  reactionsContainer: {
    background: theme.palette.background.paper,
    borderRadius: '2em',
    padding: 4,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    '@media (max-width: 450px)': {
      maxWidth: 220
    },
  },
  reactionContainer: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    '@media (max-width: 600px)': {
      width: 34,
      height: 34,
    },
  },
  reactionImage: {
    width: 34,
    height: 34,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'visible',
    cursor: 'pointer',
    display: 'block',
    '&:hover': {
      width: 40,
      height: 40
    },
    '@media (max-width: 600px)': {
      width: 32,
      height: 32,
      '&:hover': {
        width: 32,
        height: 32
      }
    },
  },

}));