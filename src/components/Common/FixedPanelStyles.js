import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  container: {
    minWidth: 300,
    maxWidth: 300,
  },
  panel: {
    minWidth: 300,
    maxWidth: 300,
    position: "sticky",
    top: props => props.top,
  },

}))