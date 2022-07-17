import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  rightMenu: {
    minWidth: 230,
  },
  languageSelectorHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: 8,
    "& > :first-child": {
      marginRight: theme.spacing(1)
    },
    marginLeft: 24,
    whiteSpace: 'nowrap'
  }
}));
