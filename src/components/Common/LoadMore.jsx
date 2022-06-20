import React from 'react'
import { makeStyles, Typography } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import ButtonWithCircularProgress from './ButtonWithCircularProgress';

const useStyles = makeStyles(theme => {
  return {
    loadMore: {
      ...theme.styles.flexCenterHoriz,
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }
})

const LoadMore = props => {
  const {enableProgress, onClick, variant, title, ...restProps} = props
  const classes = useStyles();

  return (
    <div className={classes.loadMore} >
      <ButtonWithCircularProgress
        onClick={onClick}
        enableProgress={enableProgress}
        variant={variant}
        children={title}
      />
    </div>
  )
}

export default LoadMore