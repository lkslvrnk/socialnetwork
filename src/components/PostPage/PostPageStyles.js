import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {
  return {
    rightPanel: {
      marginLeft: 16,
      '@media (max-width: 860px)': {
        display: 'none',
      },
    },
    loader: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100
    }
  }
});