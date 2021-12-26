
import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({

  reactionsContainer: {
    background: theme.palette.background.paper,
    borderRadius: '3em',
    padding: 4,
    display: 'flex'
  },
  reactionContainer: {
    width: 36,
    height: 34,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  reactionImage: {
    cursor: 'pointer',
    display: 'block',
  },

}));