import React from 'react'
import { makeStyles } from '@material-ui/core';
import { CircularProgress } from '@mui/material';

const useStyles = makeStyles(theme => {
  return {
    loadMore: {
      height: 40,
      ...theme.styles.flexCenterHoriz,
      marginTop: theme.spacing(2),
    },
  }
})

const LoadMore = React.forwardRef((props, ref) => {
  const {show, showProgress} = props
  const classes = useStyles();

  if(!show) return null

  return (
    <div className={classes.loadMore} ref={ref} >
      { showProgress && <CircularProgress size={40} /> }
    </div>
  )
})

export default LoadMore