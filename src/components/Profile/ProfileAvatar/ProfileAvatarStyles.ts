import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  container: {
    padding: '5px',
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {},
  },
  avatar: {
    height: 200,
    width: 200,
    '@media (max-width: 860px)': {
      height: 150,
      width: 150,
    },
    border: `6px solid ${theme.palette.background.default}`
  },
  editButtonRoot: {
    borderRadius: 100,
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.background.default}`
  }
}))
