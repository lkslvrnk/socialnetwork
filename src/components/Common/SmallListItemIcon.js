import { withStyles } from "@material-ui/core/styles";
import ListItemIcon from '@material-ui/core/ListItemIcon';

const SmallListItemIcon = withStyles(theme => ({
  root: {
    minWidth: theme.spacing(5)
  }
}))(ListItemIcon)

export default SmallListItemIcon
