import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  formControl: {},
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  selectLanguage: {
    '& .MuiSelect-select': {
      fontSize: theme.typography.body2.fontSize,
    }
  }
}));