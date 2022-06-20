import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  panel: {
    minWidth: 300,
    maxWidth: 300,
    position: "sticky",
    top: props => props.top,
  },
  footer: {
    marginTop: 8,
    textAlign: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    // justifyContent: 'center',
    '& > span': {
      margin: `0 4px`,
      cursor: 'pointer'
    },
    color: theme.palette.text.secondary,
    fontSize: '0.800rem'
  }
}))
