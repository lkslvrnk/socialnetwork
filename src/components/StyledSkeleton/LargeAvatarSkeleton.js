import React from 'react';
import StyledSkeleton from './StyledSkeleton.js';
import { withStyles } from "@material-ui/core/styles";

const LargeAvatarSkeleton = withStyles((theme) => ({
  root: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    background: 'red'
  }
}))(props => <StyledSkeleton variant="circle" {...props} />);

export default LargeAvatarSkeleton
