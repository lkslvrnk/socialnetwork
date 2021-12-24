import React from 'react'
import { Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

export default withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);