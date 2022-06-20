import Skeleton from '@material-ui/lab/Skeleton';
import { withStyles } from "@material-ui/core/styles";

const StyledSkeleton = withStyles((theme) => ({
  root: {
    background: theme.palette.type === 'dark'
      ? theme.palette.action.selected
      : theme.palette.action.disabled,
  }
}))(Skeleton);

export default StyledSkeleton
