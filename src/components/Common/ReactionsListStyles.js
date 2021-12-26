
import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({

  reactionsContainer: {
    background: theme.palette.background.paper,
    borderRadius: '3em',
    padding: 4,
    display: 'flex'
  },
  reactionContainer: {
    width: 42,
    height: 40,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  reactionImage: {
    cursor: 'pointer',
    display: 'block',
  },

}));